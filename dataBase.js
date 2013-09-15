dojo.provide("webapp.mySpeedDial.dataBase");
dojo.declare("webapp.mySpeedDial.dataBase",null,{

	//Buttons
	BACK:"BACK_BTN",
	HOME:"HOME_BTN",
	CALL: "CALL_BTN",
	REFRESH: "REFRESH_BTN", 

	//settings
	mySpeedDialUrl				: null,
	mySpeedDialUser				: null,
	mySpeedDialRefreshTimer		:  5,
	mySpeedDialEnablePreview	: null,
	mySpeedDialList				: [],
	mySpeedDialAppname			: 'mySpeedDial',

	_arrSpeedDials				: [],
	//SpeedDial List
	// Group: 
	//	Name
	//	Icon
	//  List of SpeedDial:
	//  	Name
	//		Picture
	//  	Phone Numbers:
	//  		Name
	//  		Number

	//dataStore
	mySpeedDialListStore: null,


	// View level
	VIEW_LEVEL_1	: 0,
	VIEW_LEVEL_2	: 1,
	NB_VIEW			: 2,

	_dtmf				: [], //dtmf to Send when call is connected

	_arrEntries                     : [], //the array holding our categories for the menu
	_boolLoading					: false,
	_boolNeedReload					: false,
	strSettingsListTitle			: "SpeedDials",
	strSettingsContainerTitle		: "",
	_arrDetails						: [],
	intCurrentCategory				: 0,
	intViewLevel					: 0,
	objCurrentSetting				: null,
	currentSettingWebapp			: "",
	intCurrentSetting				: 0,
	objSettingUI					: null,
	intChoiceListSelected			: 0,
	objAdminButtonUI				: null,
	arrOverriddenSettings			: [],
	webappView						: false,
	currentWebappName				: "",
	currentWebappViewName			: "",
	objWrongSequence				: {},


	constructor:function(){
		//called during phone initialization, refer to the constraints and limitations guide for more information about what can be done in the constructor
		var func=dojo.hitch(webapp.mySpeedDial,webapp.mySpeedDial.buttonCallback);
		var backFunc = dojo.hitch( webapp.settings, webapp.settings.buttonCallback, this.BACK);

		this.intViewLevel = this.VIEW_LEVEL_1;

		//Define the store if did not exist
		this.store = ICTouchAPI.dataStoreServices.getStore('mySpeedDialList');
		if(this.store)
		{

		}
		else //Create a new Store
		{

			this.store = ICTouchAPI.dataStoreServices.createDataStore({
				name: 'mySpeedDialList',
            	rowId: 'dataId',
            	mapping: true,
        	});
		}



		//we load the list of the Menu Main categories and categories
		this.loadList();
	},


//----------------------------------------------------------------------------
// GUI functions
//----------------------------------------------------------------------------

	// Load the main categories then subcategory for each one
	loadList : function() {
		// Don't start reloading when we already in the process
		// i just d'ont get it : if we are loading the list for the menu ... we ask a reload ?
		if( this._boolLoading ) {
			this._boolNeedReload = true;
			return;
		}
		// it seem we notify the loading of the menu
		this._boolLoading = true;
		// we set the _arrEntries empty (Holding the menu list of categories)
		
		// We get the SpeedDial Groups
		this.loadedMainCategories(this._arrSpeedDials);
	},



	//called once the main categories of the menu have been returned
	loadedMainCategories: function(_arr) {
		this._arrEntries = [];
		
		//Parse all the Groups
		if(_arr && _arr.length >0)
		{
			for (var i = 0; i < _arr.length; i++) {
				//Main Group name
				var groupIndex = this._arrEntries.length;
				var groupName = _arr[i].name;
				var groupIcon = _arr[i].icon ? _arr[i].icon : ''

				this._arrEntries.push({
					intIndex: groupIndex,
					strPrimaryContent: groupName,
					strType: "title",
					groupIcon: groupIcon,
				});


				//SpeedDial list
				if(_arr[i] && _arr[i].list && _arr[i].list.length > 0 )
				{
					for (var j = 0; j < _arr[i].list.length; j++) {
						var speeddialName =  _arr[i].list[j].name;
						var speeddialIcon =  _arr[i].list[j].icon ? _arr[i].list[j].icon : '' ;
						var speeddialList = _arr[i].list[j].list;

						this._arrEntries.push({
							intIndex: this._arrEntries.length,
							strPrimaryContent: speeddialName,
							strType: "normal",
							strMainCat: groupName,
							indexMainCat: groupIndex,
							strSubCat: speeddialName,
							speeddialList: speeddialList,
							speeddialIcon: speeddialIcon,
						});
					}	
				}
			}
		}

		//Refresh
		if (webapp.mySpeedDial.listUI)  {
			webapp.mySpeedDial.listUI.refresh();
		}

		this._boolLoading = false;

		if (this._boolNeedReload) {
			this._boolNeedReload = false;
			this.loadList();
		}
	},


	// Load the settings associated with a subcategory and make it the activ subcategory.
	// This is mostly used when a user click on a subcategory
	loadDetails : function(intIndex) {


		//intIndex : index of the clicked element in the menu list

		//Reset error sequence
		this.objWrongSequence = {};

		//???
		this._checkChange=true;
		//we change the index refering to the last 'current category' up to the new 'current category' index
		this.intCurrentCategory = intIndex;
		//getting a quick reference on the clicked category
		var obj = this._arrEntries[intIndex];

		//the level of the view ? seem to be deprecqted qnd should be erased
		this.intViewLevel = this.VIEW_LEVEL_1;

		// update action Bar
		webapp.mySpeedDial.updateActionBar();

		this._arrDetails = [];
		this.strSettingsContainerTitle = obj.strSubCat;

		if(obj && obj.speeddialList && obj.speeddialList.length >0)
		{
			for (var i = 0; i < obj.speeddialList.length; i++) {
				var self= this;
				(function(i, self){
					var phonenumber = obj.speeddialList[i].number;
			        self._arrDetails.push({	strLabel: obj.speeddialList[i].name, 
			        						strContent: obj.speeddialList[i].number,
			        						strIcon: 'communication-call', 
			        						strPrimaryIcon: 'communication-call', 
			        						callback: function() { webapp.mySpeedDial.actionSpeedDialCall(phonenumber) 
			        					   } });
			    })(i,self);
			}
		}

		if (webapp.mySpeedDial.detailsUI && !this.webappView){
			try{
				webapp.mySpeedDial.detailsUI.refresh();
			}catch(e){
				ICTouchAPI.debugServices.error("webapp.mySpeedDial.dataBase - loadedDetails / refresh of the detailsUI view crashed");
				this._arrDetails = [];
				webapp.mySpeedDial.resetActionBar();
				webapp.mySpeedDial.SpeedDialUI.setContainer("webapp.mySpeedDial.getSettingsContainer",{});
				webapp.mySpeedDial.detailsUI = webapp.mySpeedDial.SpeedDialUI.getContainer();
				if(this.intCurrentCategory >= 0){
					this.loadDetails(this.intCurrentCategory);
				}
			}
		}
	},


	//Load a specific setting when the user clicks on it
	// Update the view into edit mode
	loadSetting : function(intSetting) {
		this.intViewLevel = this.VIEW_LEVEL_2;
		// update action Bar
		webapp.settings.updateActionBar();

		this.objCurrentSetting = this._arrDetails[intSetting];
		this.strSettingsContainerTitle = this.objCurrentSetting.strSubCat;
		if (webapp.settings.detailsUI && !this.webappView){
			webapp.settings.detailsUI.refresh();
		}
	},


	// Clears the details UI, used when switching User mode as we LoadList();
	clearDetails: function() {
		//Reset error sequence
		this.objWrongSequence = {};

		// force LVL 1 - update bars - update title
		this.intViewLevel = this.VIEW_LEVEL_1;

		//webapp.mySpeedDial.updateActionBar();
		this.strSettingsContainerTitle = "";

		this.intCurrentCategory = undefined;
		this._arrDetails = [];

		this.intCurrentSetting = 0;
		this.objCurrentSetting = null;

		if (webapp.mySpeedDial.detailsUI && !this.webappView){
			webapp.mySpeedDial.detailsUI.refresh();
		}
	},


	getSettingsContainerTitle: function(){
		return this.strSettingsContainerTitle;
	},

	getSettingsListTitle:function(){
		return this.strSettingsListTitle;
	},

	getListEntries: function(){
		return this._arrEntries;
	},

	getDetails: function(){
		if( this._arrDetails === undefined ){
			return [];
		}

		return this._arrDetails;
	},


	setCurrentObj : function(intSetting) {
		this.intCurrentSetting = intSetting;
		this.objCurrentSetting = this._arrDetails[intSetting];
	},


//----------------------------------------------------------------------------
// Call functions
//----------------------------------------------------------------------------
	setDTMF : function(dtmf) {
		try{
			this._dtmf = [];
			this._dtmf = dtmf.split('');
		}
		catch(exception){}
		
	},

	getDTMF : function() {
		return this._dtmf;
	},



//----------------------------------------------------------------------------
//Store functions
//----------------------------------------------------------------------------

	//method removing the first item from the datastore
    removeDatatoStore: function(){
      var templist = this.data.store.getList();
      //removeAt uses the property defined as rowId to find the element to remove - here we remove the first one
      this.data.store.removeAt(templist[0].dataId);
    },

    removeAllDatatoStore: function(){
      var templist = this.store.getList();
      if(templist && templist.length > 0 && this.store)
      {
      	for (var i = 0; i < templist; i++)
      		{
      			this.store.removeAt(templist[0].dataId);
      		}
      }
    },

    //method adding data to the dataStore - I generate Data using present timestamp
    addDatatoStore:function(data) {
        var timestamp = (new Date()).getTime();
        if(this.store) {
        	this.store.add({dataId: timestamp, value: data});
        }       
    },

    //method adding data to the dataStore - I generate Data using present timestamp
    getDatafromStore:function() {
        if(this.store) {
        	var list = [];
        	var templist = this.store.getList();
        	if(templist && templist.length >0)
        	{
        		return templist[0].value;
        	}
        	else
        	{
        		return [];
        	}
        }       
    },
});
