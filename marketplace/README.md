[RICE](https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/) is an acronym for the four factors that are used to evaluate each project idea: reach, impact, confidence and effort.

![RICE = (Reach * Impact * Confidence) / Effort](marketplace/formula.png)


## Setup
RICE extension enables a **calculated field** for computing and storing the RICE score on your work items.

1. The first thing you need is to create the field that will store the RICE value.  [Create a custom decimal field](https://www.visualstudio.com/en-us/docs/work/process/customize-process-field#add-a-custom-field) through the process hub and add it to the work items you want to display it.

![Create a custom decimal field](marketplace/new-field.png)

2. Navigate to the "RICE" hub on the collection settings admin experience. From here, you must specify the fields that will be used for Reach, Impact, Confidence, Effort and RICE Score.

![RICE displaying on the work item form](marketplace/settings-hub.png)


## Features
### Settings hub
* Specify which fields are used for Reach, Impact, Confidence, Effort and RICE Score.

![Mapping fields for calculation](marketplace/mapping-fields.gif)


### Auto calculated RICE Score field on the form
* RICE is automatically updated when form is loaded.
* RICE is automatically updated when the Reach, Impact, Confidence or Effort fields are updated.

![RICE is automatically updated on the work item form](marketplace/auto-calc.gif)
