dojo.require("webapp.mySpeedDial.getMySpeedDialBase");
dojo.provide("webapp.mySpeedDial.getMySpeedDial");
dojo.declare("webapp.mySpeedDial.getMySpeedDial",
	webapp.mySpeedDial.getMySpeedDialBase,
	{
		templatePath:dojo.moduleUrl("webapp.mySpeedDial","templates/getMySpeedDial8082.html"),

		contructor: function(){
		//called during phone initialization, refer to the constraints and limitations guide for more information about what can be done in the constructor
		},
		postMixInProperties: function(){
		//called after the properties of the widget have been set, refer to the constraints and limitations guide for more information
		},

		postCreate:function(){
			 //called after the widget is created (DOM included) but before it is rendered
			new UIElements.ContainerTitle.ContainerTitleControl({
				strLabel:_("Content","webapp.mySpeedDial")
			},this.domTitle);
		},

		startup: function(){
			//called after the widget and its child widget have been created and added to the DOM
		},

		destroy: function(){
			//called when the widget is deleted, write any additionnal "tear down" work here
		}
	}
);
