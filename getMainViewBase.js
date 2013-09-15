dojo.provide("webapp.mySpeedDial.getMainViewBase");
dojo.declare("webapp.mySpeedDial.getMainViewBase",[ICTouchAPI.webWidget,dojox.dtl._Templated],{

	constructor: function(){
		//called during phone initialization, refer to the constraints and limitations guide for more information about what can be done in the constructor
	},

	postMixInProperties:function(){
		//called after the properties of the widget have been set, refer to the constraints and limitations guide for more information
	},

	postCreate:function(){
		//creation of the main container of the webapp
		webapp.mySpeedDial.SpeedDialUI = new UIElements.ApplicationMode.ThirdControl(
		{
			menu : {
				name    : "webapp.mySpeedDial.getSpeedDialList",
				params  : {}
			},

			container : {
				name    : "webapp.mySpeedDial.getSpeedDialContainer",
				params  : {}
			}
		},this.domMainView);
		//saving some references
			
		webapp.mySpeedDial.detailsUI = webapp.mySpeedDial.SpeedDialUI.getContainer();
		webapp.mySpeedDial.listUI = webapp.mySpeedDial.SpeedDialUI.getMenu();

		//Add Home button
		var data=webapp.mySpeedDial.data;
		var func=dojo.hitch(webapp.mySpeedDial,webapp.mySpeedDial.buttonCallback);
		var buttonBack=new UIElements.AppButton.AppButtonControl({ strButtonName:data.BACK,strButtonLabel:_("Home","webapp.mySpeedDial"),strButtonIcon:"generic-homepage",callback:func});

		this.webapp.createMainViewButtons();

		//Load SpeedDial
		webapp.mySpeedDial.getSpeedDials();
	},

	startup: function(){
		//called after the widget and its child widget have been created and added to the DOM
	},

	destroy: function(){
		//called when the widget is deleted, write any additionnal "tear down" work here
	},

});
