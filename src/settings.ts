import './settings.scss';

import Q = require('q');
import Contracts = require('TFS/WorkItemTracking/Contracts');
import WIT_Client = require('TFS/WorkItemTracking/RestClient');
import Controls = require('VSS/Controls');
import { Combo, IComboOptions } from 'VSS/Controls/Combos';
import Menus = require('VSS/Controls/Menus');

import { IStoredFieldReferences } from './stored-field-references';

export class Settings {
  selectedFields: IStoredFieldReferences;
  fields: Contracts.WorkItemField[];
  menuBar = null;
  changeMade = false;

  public initialize() {
    const menubarOptions = {
      items: [
        { id: 'save', icon: 'icon-save', title: 'Save the selected field' }
      ],
      executeAction: (args) => {
        const command = args.get_commandName();
        switch (command) {
          case 'save':
            this.save();
            break;
          default:
            console.log('Unhandled action: ' + command);
            break;
        }
      }
    };
    const riceContainer = $('#rice-settings');
    this.menuBar = Controls.create<Menus.MenuBar, any>(Menus.MenuBar, riceContainer, menubarOptions);

    const reachContainer = $('<div />').addClass('settings-control').appendTo(riceContainer);
    $('<label />').text('Reach Field').appendTo(reachContainer);

    const impactContainer = $('<div />').addClass('settings-control').appendTo(riceContainer);
    $('<label />').text('Impact Field').appendTo(impactContainer);

    const confidenceContainer = $('<div />').addClass('settings-control').appendTo(riceContainer);
    $('<label />').text('Confidence Field').appendTo(confidenceContainer);

    const effortContainer = $('<div />').addClass('settings-control').appendTo(riceContainer);
    $('<label />').text('Effort Field').appendTo(effortContainer);

    const riceScoreContainer = $('<div />').addClass('settings-control').appendTo(riceContainer);
    $('<label />').text('RICE Score Field').appendTo(riceScoreContainer);

    VSS.getService<IExtensionDataService>(VSS.ServiceIds.ExtensionData)
      .then((dataService: IExtensionDataService) => {
        dataService.getValue<IStoredFieldReferences>('storedFields')
          .then((storedFields: IStoredFieldReferences) => {
            if (storedFields) {
              this.selectedFields = storedFields;
            } else {
              this.selectedFields = {
                reachField: null,
                impactField: null,
                confidenceField: null,
                effortField: 'Microsoft.VSTS.Scheduling.Effort',
                riceScoreField: 'Microsoft.VSTS.Common.BusinessValue'
              };
            }

            this.getSortedFieldsList().then((fieldList) => {
              Controls.create(Combo, reachContainer, this.getComboOptions('reachValue', fieldList, this.selectedFields.reachField));
              Controls.create(Combo, impactContainer, this.getComboOptions('impactValue', fieldList, this.selectedFields.impactField));
              Controls.create(Combo, confidenceContainer, this.getComboOptions('confidenceValue', fieldList, this.selectedFields.confidenceField));
              Controls.create(Combo, effortContainer, this.getComboOptions('effortValue', fieldList, this.selectedFields.effortField));
              Controls.create(Combo, riceScoreContainer, this.getComboOptions('riceScoreValue', fieldList, this.selectedFields.riceScoreField));
              this.updateSaveButton();

              VSS.notifyLoadSucceeded();
            });
          });
      });
  }

  private getSortedFieldsList() {
    const deferred = Q.defer();
    WIT_Client.getClient()
      .getFields()
      .then((fields: Contracts.WorkItemField[]) => {
        this.fields = fields.filter((f: Contracts.WorkItemField) => (f.type === Contracts.FieldType.Double || f.type === Contracts.FieldType.Integer));
        const sortedFields = this.fields.map((f: Contracts.WorkItemField) => f.name).sort((field1, field2) => {
          if (field1 > field2)
            return 1;
          else if (field1 < field2)
            return -1;
          else
            return 0;
        });
        deferred.resolve(sortedFields);
      });

    return deferred.promise;
  }

  private getComboOptions(id, fieldsList, initialField): IComboOptions {
    const that = this;
    return {
      id,
      mode: 'drop',
      source: fieldsList,
      enabled: true,
      value: that.getFieldName(initialField),
      change() {
        that.changeMade = true;
        const fieldName = this.getText();
        const fieldReferenceName: string = (this.getSelectedIndex() < 0) ? null : that.getFieldReferenceName(fieldName);

        switch (this._id) {
          case 'reachValue':
            that.selectedFields.reachField = fieldReferenceName;
            break;
          case 'impactValue':
            that.selectedFields.impactField = fieldReferenceName;
            break;
          case 'confidenceValue':
            that.selectedFields.confidenceField = fieldReferenceName;
          case 'effortValue':
            that.selectedFields.effortField = fieldReferenceName;
            break;
          case 'riceScoreValue':
            that.selectedFields.riceScoreField = fieldReferenceName;
            break;
        }
        that.updateSaveButton();
      }
    };
  }

  private save() {
    VSS.getService<IExtensionDataService>(VSS.ServiceIds.ExtensionData)
      .then((dataService: IExtensionDataService) => {
        dataService.setValue<IStoredFieldReferences>('storedFields', this.selectedFields)
          .then((storedFields: IStoredFieldReferences) => {
            this.changeMade = false;
            this.updateSaveButton();
          });
      });
  }

  private getFieldName(fieldReferenceName): string {
    let matchingFields = this.fields.filter((f: Contracts.WorkItemField) => f.referenceName === fieldReferenceName);
    return (matchingFields.length > 0) ? matchingFields[0].name : null;
  }

  private getFieldReferenceName(fieldName): string {
    let matchingFields = this.fields.filter((f: Contracts.WorkItemField) => f.name === fieldName);
    return (matchingFields.length > 0) ? matchingFields[0].referenceName : null;
  }

  private updateSaveButton() {
    const buttonState = (this.selectedFields.reachField && this.selectedFields.impactField && this.selectedFields.confidenceField &&
      this.selectedFields.effortField && this.selectedFields.riceScoreField) && this.changeMade
      ? Menus.MenuItemState.None : Menus.MenuItemState.Disabled;

    // Update the disabled state
    this.menuBar.updateCommandStates([
      { id: 'save', disabled: buttonState },
    ]);
  }
}
