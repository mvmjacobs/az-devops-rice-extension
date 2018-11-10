import Q = require('q');
import Contracts = require('TFS/WorkItemTracking/Contracts');
import { WorkItemFormService } from 'TFS/WorkItemTracking/Services';

import { IStoredFieldReferences } from './stored-field-references';

function GetStoredFields() {
  const deferred = Q.defer();
  VSS.getService<IExtensionDataService>(VSS.ServiceIds.ExtensionData)
    .then((dataService: IExtensionDataService) => {
      dataService.getValue<IStoredFieldReferences>('storedFields')
        .then((storedFields: IStoredFieldReferences) => {
          if (storedFields) {
            deferred.resolve(storedFields);
          } else {
            deferred.reject('Failed to retrieve fields from storage');
          }
        });
    });
  return deferred.promise;
}

function getWorkItemFormService() {
  return WorkItemFormService.getService();
}

function updateRICEScoreOnForm(storedFields: IStoredFieldReferences) {
  getWorkItemFormService()
    .then((service) => {
      service.getFields()
        .then((fields: Contracts.WorkItemField[]) => {
          const matchingReachValueFields = fields.filter((f: Contracts.WorkItemField) => f.referenceName === storedFields.reachField);
          const matchingImpactValueFields = fields.filter((f: Contracts.WorkItemField) => f.referenceName === storedFields.impactField);
          const matchingConfidenceValueFields = fields.filter((f: Contracts.WorkItemField) => f.referenceName === storedFields.confidenceField);
          const matchingEffortValueFields = fields.filter((f: Contracts.WorkItemField) => f.referenceName === storedFields.effortField);
          const matchingRICEScoreValueFields = fields.filter((f: Contracts.WorkItemField) => f.referenceName === storedFields.riceScoreField);

          if (matchingReachValueFields.length > 0 && matchingImpactValueFields.length > 0 && matchingConfidenceValueFields.length > 0 && matchingEffortValueFields.length > 0 && matchingRICEScoreValueFields.length > 0) {
            service.getFieldValues([storedFields.reachField, storedFields.impactField, storedFields.confidenceField, storedFields.effortField])
              .then((values) => {
                const reachValue = +values[storedFields.reachField];
                const impactValue = +values[storedFields.impactField];
                const confidenceValue = +values[storedFields.confidenceField];
                const effortValue = +values[storedFields.effortField];

                let rice = 0;
                if (effortValue > 0) {
                  rice = (reachValue * impactValue * confidenceValue) / effortValue;
                }

                service.setFieldValue(storedFields.riceScoreField, rice);
              });
          }
        });
    });
}

const formObserver = () => {
  return {
    onFieldChanged: (args) => {
      GetStoredFields()
        .then((storedFields: IStoredFieldReferences) => {
          if (storedFields && storedFields.reachField && storedFields.impactField && storedFields.confidenceField && storedFields.effortField && storedFields.riceScoreField) {
            if (!args.changedFields[storedFields.reachField] || !args.changedFields[storedFields.impactField] || !args.changedFields[storedFields.confidenceField] || !args.changedFields[storedFields.effortField]) {
              updateRICEScoreOnForm(storedFields);
            }
          } else {
            console.log('Unable to calculate RICE Score, please configure fields on the collection settings page.');
          }
        }, (reason) => {
          console.log(reason);
        });
    },

    onLoaded: () => {
      GetStoredFields()
        .then((storedFields: IStoredFieldReferences) => {
          if (storedFields && storedFields.reachField && storedFields.impactField && storedFields.confidenceField && storedFields.effortField && storedFields.riceScoreField) {
            updateRICEScoreOnForm(storedFields);
          } else {
            console.log('Unable to calculate RICE Score, please configure fields on the collection settings page.');
          }
        }, (reason) => {
          console.log(reason);
        });
    }
  };
};

const extensionContext = VSS.getExtensionContext();
VSS.register(`${extensionContext.publisherId}.${extensionContext.extensionId}.rice-work-item-form-observer`, formObserver);
