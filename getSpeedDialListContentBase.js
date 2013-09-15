dojo.provide("webapp.mySpeedDial.getSpeedDialListContentBase");
dojo.declare("webapp.mySpeedDial.getSpeedDialListContentBase", 
	[ICTouchAPI.webWidget, dojox.dtl._Templated],
	{
		postCreate:function(){
			ICTouchAPI.debugServices.error("webapp.mySpeedDial.getSpeedDialListContentBase.postCreate() - start");


			var settingsList = webapp.mySpeedDial.data.getListEntries();

			var func = function(value) {
					webapp.mySpeedDial.data.loadDetails(value);
			};
			
			var callbackCollapsed = dojo.hitch(webapp.mySpeedDial.data, webapp.mySpeedDial.data.clearDetails);
			webapp.mySpeedDial.categoriesListUI =  new UIElements.MenuList.MenuListControl({ arrItems: settingsList, callback: func, boolAutoCollapse: true, funcCollapsed: callbackCollapsed }, this.domListContent);

			ICTouchAPI.debugServices.error("webapp.mySpeedDial.getSpeedDialListContentBase.postCreate() - done");
		}
	});