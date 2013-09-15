dojo.provide("webapp.mySpeedDial.getSpeedDialContainerBase");
dojo.declare("webapp.mySpeedDial.getSpeedDialContainerBase",
    [ICTouchAPI.webWidget, dojox.dtl._Templated],
    {
		objContent : null,

		postCreate:function(){
            var data = webapp.mySpeedDial.data;

            //we get the content of _arrDetails which hold our mySpeedDial and UIElements
			var list = data.getDetails();
			var title = data.getSettingsContainerTitle();
			
			// Create a fragment for the presentationList
			var frag = document.createDocumentFragment();
			var div = dojo.create("div", { }, frag);

			//the container of my UIelements
			var container = new UIElements.Container.ContainerControl(
	        {
			 objTitle: {
              strLabel : data.getSettingsContainerTitle()
	         },
			//presentation list take an array and add the object in some DOM ????
			 objContent: {
	            name	: "UIElements.PresentationList.PresentationListControl",
	            params  : { arrItems : list, 
	            			boolShowLabel: true,
	            			boolShowIcon: true,
	            		  }
	            }
	        }, div);

			this.domContainer.ownerDocument.adoptNode(container.domNode);
			container.placeAt(this.domContainer);

			//saving a reference
			webapp.mySpeedDial.settingsContainer = container;
			this.objContent = container.getContent();
		},
		
        destroy : function(){//do not use except if you want to carsh the target
            this.objContent.destroy();
            this.inherited(arguments);
        }
	}
);
