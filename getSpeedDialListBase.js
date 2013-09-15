dojo.provide("webapp.mySpeedDial.getSpeedDialListBase");
dojo.declare("webapp.mySpeedDial.getSpeedDialListBase",
	[ICTouchAPI.webWidget, dojox.dtl._Templated],
	{
		postCreate:function(){
            //getting the entries list : main category, category
            var settingsList = webapp.mySpeedDial.data.getListEntries();
            
			//defining the callback function called when the menulist is collapsed
			var callbackCollapsed = dojo.hitch(webapp.mySpeedDial, webapp.mySpeedDial.onMenuCollapse);
            
            //creating the conatiner for the menulist (1/3 panel)
            webapp.mySpeedDial.containerList = new UIElements.Container.ContainerControl(
            {
                        	objTitle: {
                        		strLabel    : _("SpeedDials","webapp.mySpeedDial")
                        	},
                                //the menu list
                                objContent: {
                                	name    :   "UIElements.MenuList.MenuListControl",
                                	params  : {
                                		arrItems: settingsList,
                                		callback: function(value) { webapp.mySpeedDial.onMenuClick(value) },
                                		boolAutoCollapse: true,
                                		funcCollapsed: callbackCollapsed
                                	}
                                }
            }, this.domList);

            //saving a reference on the container content : the menu list
            webapp.mySpeedDial.categoriesListUI = webapp.mySpeedDial.containerList.getContent();
        }
    });