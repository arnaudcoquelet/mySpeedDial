dojo.provide("webapp.mySpeedDial.controlBase");
dojo.declare("webapp.mySpeedDial.controlBase",[ICTouchAPI.webApplication],{
  listUI          : null, //reference on the left part of the main view, the main menu
  detailsUI       : null, //reference on the right part of the main view, the part with the UIElements
  SpeedDialUI             : null, //reference on the global container
  categoriesListUI        : null, //reference on the list of settings present in the menu


  webappViewUI      : null,
    settingsContainer     : null,
    containerList         : null,
    viewContainer         : null,


    _backButton: null,
  _directionCallBackButtonByDefault: "webapp.homepage.getHomepage",
  _directionCallBackButton: null,

  menuList : null,
  previewMenuList : null,
  previewContainer : null,
  previewMenuClickHandler : null,



  constructor:function(){
    //called during phone initialization, refer to the constraints and limitations guide for more information about what can be done in the constructor
    ICTouchAPI.tools.registerHomepageButton(["webapp.mySpeedDial.getMainView","MYSPEEDDIAL_BTN","mySpeedDial-application",_("mySpeedDial","webapp.mySpeedDial")]);
    ICTouchAPI.tools.registerHomepageKey(["webapp.mySpeedDial.getMainView","MYSPEEDDIAL_BTN","mySpeedDial-application",_("mySpeedDial","webapp.mySpeedDial")]);
    ICTouchAPI.eventServices.subscribeToEvent(this, "CallConnectedEvent",this.onCallConnected);
    ICTouchAPI.eventServices.subscribeToEvent(this, "OutgoingCallFailedEvent",this.onOutgoingCallFailed);
    ICTouchAPI.eventServices.subscribeToEvent(this, "OutgoingCallCancelledEvent",this.onOutgoingCallCancelled);
    ICTouchAPI.eventServices.subscribeToEvent(this, "CallEndedEvent",this.onCallEnded);
    ICTouchAPI.eventServices.subscribeToEvent(this, "CallIgnoredEvent",this.onCallIgnored);
    ICTouchAPI.eventServices.subscribeToEvent(this, "CallStartedEvent",this.onCallStarted);
  },

  loaded: function(){
    //executed after controler and data constructors, refer to constraints and limitations guide for more information about what can be done in this method
    this.data.loadList();
  },

  load: function(){
    //Load the settings
    this.updateAllSettings();

    //Refresh the SpeedDials
    this.getSpeedDials();
  },

  buttonCallback:function(buttonId){
    dojo.publish("OpenHomepage");
  },

  unload:function(){
    //called when the webapp is unloaded, unsubscrive to events here
  },

  unlock:function(WebappName){
    //executed whenever the webapp is exiting

    //do not remove this line has it could potentially block the phone
    dojo.publish("unlockTransition",[true]);
  },




//  resetActionBar: function ()
//  {
//
//  },


  getSpeedDialsTest : function ()
  {
    this.data._arrSpeedDials = [];
    this.data._arrSpeedDials.push({'name' : 'Group1', 'icon' : 'Icon1',
                     'list' : [{'name' : 'SpeedDial11', 'icon': 'Icon11', 'list' : [{'name':'cell', 'number' : '1901254'},{'name':'office', 'number' : '11112'},{'name':'office', 'number' : '11113'}]},
                           {'name' : 'SpeedDial12', 'icon': 'Icon12', 'list' : [{'name':'cell', 'number' : '1901254'},{'name':'office', 'number' : '22222'}]},
                           {'name' : 'SpeedDial13', 'icon': 'Icon13', 'list' : [{'name':'cell', 'number' : '1901254'},{'name':'office', 'number' : '33332'}]} ]
                  });
    this.data._arrSpeedDials.push({'name' : 'Group2', 'icon' : 'Icon2',
                     'list' : [{'name' : 'SpeedDial21', 'icon': 'Icon21', 'list' : [{'name':'home', 'number' : '1901254'},{'name':'office', 'number' : '11112'}]},
                           {'name' : 'SpeedDial22', 'icon': 'Icon22', 'list' : [{'name':'home', 'number' : '1901254'},{'name':'office', 'number' : '22222'}]},
                           {'name' : 'SpeedDial23', 'icon': 'Icon23', 'list' : [{'name':'home', 'number' : '1901254'},{'name':'office', 'number' : '33332'}]} ]
                  });

  },

  getSpeedDials : function ()
  {
    console.warn("getSpeedDials()");

    if(this.data)
    {
      if(this.data.mySpeedDialUrl){
        var url = this.data.mySpeedDialUrl + this.data.mySpeedDialUser ;

        this.httpRequest({
          url: url,
          method:"get",
          responseType:"text",
          timeout : 5000,
          callback: this.gotSpeedDials,
          callbackError : this.errorOnHttpRequest,
          context:this
        });
      }
      else
      {
        this.updateAllSettings();

        //If not connected to the HTTP server, load what is in memory
        if(this.data.mySpeedDialList) {
          this.data._arrSpeedDials = this.data.mySpeedDialList;
          this.data.loadList();
        }
      }
    }

    //Plan for Refresh (each 5min by default)
    this.setRefreshSpeedDials();
  },


  gotSpeedDials : function(xmlStream, callBackParams)
  {
    var speedDialGroups = dojo.fromJson(xmlStream);
    
    //Get the list of SpeedDials
    this.data._arrSpeedDials = speedDialGroups;

    //Save to settings
    this.data.mySpeedDialList = this.data._arrSpeedDials;
    this.setMySpeedDialList(this.data.mySpeedDialList);

    this.data.loadList();
  },


  refreshSpeedDials : function ()
  {
    //Load the settings
    this.updateAllSettings();

    //Refresh the SpeedDials
    this.getSpeedDials();

    //
    this.data.clearDetails();
  },

  setRefreshSpeedDials: function()
  {
    //Setup a refresh every X minutes (5 by default)
    var t=this;

    if(this.data)
    {
      if(this.data.getSpeedDialsTimeout !== null){
        clearTimeout(this.data.getSpeedDialsTimeout);
      }
      this.data.getSpeedDialsTimeout = setTimeout(function () {t.refreshSpeedDials();} , (t.data.mySpeedDialRefreshTimer * 60 * 1000) || (5 * 60 * 1000)) ;
    }
    else
    {
      setTimeout(function () {t.refreshSpeedDials();} , (t.data.mySpeedDialRefreshTimer * 60 * 1000) || (5 * 60 * 1000));
    }
  },


  refreshMenu : function ()
  {
    if(this.mainContainer !== null) 
      { 
        this.mainContainer.getMenu().refresh({autoCollapse : true}); 
      }
  },

  refreshWebappView : function() {
    if (this.webappViewUI){
      this.webappViewUI.refresh();
        }
  },

  refreshMessageDetails : function(objMessage)
  { //Reload 2/3 Part with the corresponding informations
    if(this.mainWidget !== null && objMessage !== null) 
      {
        this.mainWidget.reloadContainer();
      }
  },


  //***************************************************************************************//
  //Callbacks
  //***************************************************************************************//
  onChoiceClicked : function(intIndex) {
    this.data.intChoiceListSelected = intIndex;
  },
  
  onMenuCollapse : function() {
    this.data.clearDetails();
  },

  //defining the callback function called when the menulist is clicked
  onMenuClick : function(value) {
    webapp.mySpeedDial.data.loadDetails(value);
  },


  previewMenuClicked : function(intIndex)
  {
    this.data.indexPreview = intIndex;
    // the element can be selected only if the view is loaded
    if(!this.previewMenuClickHandler){
      this.previewMenuClickHandler = dojo.subscribe("iframe.show", dojo.hitch(this, this.selectCurrentFromPreviewMenu));
    }
  },

  selectCurrentFromPreviewMenu:function(currentIframeId)
  {
    // test if it’s the good frame
    if(currentIframeId == "webapp.mySpeedDial.getMainView"){
    // select the item
      this.menuList.selectItemByIndex(this.data.indexPreview, true);
    }
  },


//***************************************************************************************//
//Main View buttons
//***************************************************************************************//
  createMainViewButtons : function ()
  {
    var arrButtons = [];
    arrButtons.push({
      strButtonName: this.data.BACK, // name of the button
      strButtonLabel: _("Home", "webapp.mySpeedDial"), // label of the button
      strButtonIcon: 'generic-homepage', // icon of the button
      strStatusText:'',
      strStatusIcon:'',
      callback: {context:this, func:this.buttonCallback} 
    });

    arrButtons.push({
      strButtonName: this.data.REFRESH, // name of the button
      strButtonLabel: _("Refresh", "webapp.mySpeedDial"), // label of the button
      strButtonIcon: 'mySpeedDial-refresh', // icon of the button
      strStatusText:'',
      strStatusIcon:'',
      callback: {context:this, func:this.actionSpeedDialGroupRefresh}
    });

    // Add buttons to appbar
    var appBar = ICTouchAPI.AppBarServices.getAppBar("mySpeedDial", "getMainView");
    appBar.removeAllActionButtons();

    for (var i in arrButtons) {
      var objButton = new UIElements.AppButton.AppButtonControl(arrButtons[i]);
      appBar.addActionButton(objButton);
    }
  },

  updateActionBar : function()
  {
    this.createMainViewButtons();
  },

  hideAllMainViewButtons : function ()
  {
    var appBar = ICTouchAPI.AppBarServices.getAppBar("myAVST", "getMainView" );
    if(appBar.getAllButtons().length) 
    {
      appBar.getButton(this.data.REFRESH).hide();
    }
  },

  showAllMainViewButtons : function ()
  {
    var appBar = ICTouchAPI.AppBarServices.getAppBar("myAVST", "getMainView" );
    if(appBar.getAllButtons().length) 
    {
      appBar.getButton(this.data.REFRESH).show();
    }
  },

  actionSpeedDialGroupRefresh: function ()
  {
    //Reload the Settings
    this.updateAllSettings();


    //Refresh the SpeedDials
    this.getSpeedDials();

    this.data.loadList();

    //
    this.data.clearDetails();
  },

//***************************************************************************************//
//Group View buttons
//***************************************************************************************//
  createGroupViewButtons : function ()
  {
    var arrButtons = [];
    arrButtons.push({
      strButtonName: this.data.CALL, // name of the button
      strButtonLabel: _("Call", "webapp.mySpeedDial"), // label of the button
      strButtonIcon: 'mySpeedDial-call', // icon of the button
      strStatusText:'',
      strStatusIcon:'',
      callback: {context:this, func:this.actionSpeedDialCall}
    });

    // Add buttons to appbar
    var appBar = ICTouchAPI.AppBarServices.getAppBar("mySpeedDial", "getGroupView");
    appBar.removeAllActionButtons();

    for (var i in arrButtons) {
      var objButton = new UIElements.AppButton.AppButtonControl(arrButtons[i]);
      appBar.addActionButton(objButton);
    }
  },

  hideAllGroupViewButtons : function ()
  {
    var appBar = ICTouchAPI.AppBarServices.getAppBar("mySpeedDial", "getGroupView" );
    if(appBar.getAllButtons().length) 
    {
      appBar.getButton(this.data.CALL).hide();
    }
  },

  showAllGroupViewButtons : function ()
  {
    var appBar = ICTouchAPI.AppBarServices.getAppBar("mySpeedDial", "getGroupView" );
    if(appBar.getAllButtons().length) 
    {
      appBar.getButton(this.data.CALL).show();
    }
  },

  actionSpeedDialCall: function (number)
  {
    this.data.setDTMF("");

    if(number)
    {
      //Generate a call
      ICTouchAPI.debugServices.info("webapp.mySpeedDial.actionSpeedDialCall() - number to call:" + number);

      var numbers=[].concat( number.split("$") );
      var dtmfKeyBoardVisible = false;
      if(numbers.length >=2) { 
        dtmfKeyBoardVisible = true;
        this.data.setDTMF(numbers[1]); 
        
        ICTouchAPI.debugServices.info("webapp.mySpeedDial.actionSpeedDialCall() - number to call:" + numbers[0] + " DTMF:" + numbers[1]);
      }

      if(numbers.length >=1) {
        ICTouchAPI.debugServices.info("webapp.mySpeedDial.actionSpeedDialCall() - Calling:" + numbers[0]);

        ICTouchAPI.APIServices.Telephony.startPhoneCall(
          { 
            params:[numbers[0], false, true, dtmfKeyBoardVisible], 
            context:this
          });
      }
    }
  },


 sendDTMF: function(callId, dtmfs)
 {
  try{
    if(dtmfs.length >0)
    {
        var cDtmf = dtmfs.shift();
        var number = -1;

        //Translate
        if(cDtmf == 'P' || cDtmf == 'p')      { number = -1; }
        else if(cDtmf == 'A' || cDtmf == 'a') { number = 12; }
        else if(cDtmf == 'B' || cDtmf == 'b') { number = 13; }
        else if(cDtmf == 'C' || cDtmf == 'c') { number = 14; }
        else if(cDtmf == 'D' || cDtmf == 'd') { number = 15; }
        else if(cDtmf == '#') { number = 11; }
        else if(cDtmf == '*') { number = 10; }
        else { number = parseInt(cDtmf);     }

        //Send each DTMF    -1 for pause
        if(number>= 0) {
          try{
            ICTouchAPI.debugServices.info("webapp.mySpeedDial.sendDTMF() DTMF(" + callId + "):" + cDtmf.toString() + "(" + number.toString() + ")");

            ICTouchAPI.APIServices.Telephony.sendDTMF({ params:[callId, number], context:this });
          }
          catch(exception) {
            ICTouchAPI.debugServices.error("webapp.mySpeedDial.sendDTMF():" + exception);
          }
        }
    }
  }
  catch(exception) {  
    ICTouchAPI.debugServices.error("webapp.mySpeedDial.sendDTMF():" + exception);
  }

    if(dtmfs.length >0) {
      //If more DTMF top send 
      var _this = this;
      setTimeout( function() {_this.sendDTMF(callId, dtmfs); }, 1000 ); 
    }
    else
    {
      //If all DTMF were sent, reset the DTMF var
      this.data.setDTMF("");
      ICTouchAPI.debugServices.info("webapp.mySpeedDial.sendDTMF(): no more DTMF to send");
    }
 },


 onCallConnected: function(params)
 {
    try{
      //Generate a call
      ICTouchAPI.debugServices.info("webapp.mySpeedDial.onCallConnected() - call connected:" + dojo.toJson(params) );

      var dtmfs = this.data.getDTMF();
      var callId = params.value.value;

      if(dtmfs.length >0)
      {
          this.sendDTMF(callId, dtmfs);
      }
    }
    catch(exception){ 
      ICTouchAPI.debugServices.error("webapp.mySpeedDial.onCallConnected():" + exception);
    }
 },

 onOutgoingCallFailed: function(param)
 {
    try{
      ICTouchAPI.debugServices.info("webapp.mySpeedDial.onOutgoingCallFailed() - call failed:" + dojo.toJson(params) );
    }
    catch(exception){ 
      ICTouchAPI.debugServices.error("webapp.mySpeedDial.onOutgoingCallFailed():" + exception);
    }
 },

 onOutgoingCallCancelled: function(params)
 {
    try{
      ICTouchAPI.debugServices.info("webapp.mySpeedDial.onOutgoingCallCancelled() - call canceled:" + dojo.toJson(params) );
    }
    catch(exception){ 
      ICTouchAPI.debugServices.error("webapp.mySpeedDial.onOutgoingCallCancelled():" + exception);
    }
 },

 onCallEnded: function(params)
 {
    try{
      ICTouchAPI.debugServices.info("webapp.mySpeedDial.onOutgoingCallCancelled() - call ended:" + dojo.toJson(params));
    }
    catch(exception){ 
      ICTouchAPI.debugServices.error("webapp.mySpeedDial.onOutgoingCallCancelled():" + exception);
    }
 },

 onCallIgnored: function(params)
 {
    try{
      ICTouchAPI.debugServices.info("webapp.mySpeedDial.onCallIgnored() - call ignored:" + dojo.toJson(params) );
    }
    catch(exception){ 
      ICTouchAPI.debugServices.error("webapp.mySpeedDial.onCallIgnored():" + exception);
    }
 },

 onCallStarted: function(params)
 {
    try{
      ICTouchAPI.debugServices.info("webapp.mySpeedDial.onCallStarted() - call started:" + dojo.toJson(params) );
    }
    catch(exception){ 
      ICTouchAPI.debugServices.error("webapp.mySpeedDial.onCallStarted():" + exception);
    }
 },



//***************************************************************************************//
//HTTPRequest
//***************************************************************************************//
  httpRequest: function(args) {

      //Using the API
      ICTouchAPI.HttpServices.httpRequest(args);


      //Not using the API
      //if (args.method == "get") {
      //  return dojo.xhrGet(args);
      //} else if (args.method == "post") {
      //  return dojo.xhrPost(args);
      //} else {
      //  return false;
      //}
  },
  
  errorOnHttpRequest : function(error){
/*    var context = this;
    var buttons = [];
    // Create OK button to display in the popup
    buttons.push({
      strButtonLabel: _("Close","webapp.mySpeedDial"),
      callback: function () {
        // When click on OK, the popup must be removed
        ICTouchAPI.popupServices.removePopup(context.objServerPopup);
        context.objServerPopup = null;
      }
    });
    // Create the content of the popup
    var popupData = {
      strTitle: _("Error","webapp.mySpeedDial"),
      strType: "error",
      strContent: _("HTTP Server Unreachable","webapp.mySpeedDial"),
      arrPopupButtons: buttons
    };
    // Create and open the popup if not already displayed
    if (!this.objServerPopup){
      this.objServerPopup = ICTouchAPI.popupServices.addNewPopup(popupData, "MEDIUM");
    }
*/

    ICTouchAPI.debugServices.error("webapp.mySpeedDial.errorOnHttpRequest():" + _("HTTP Server Unreachable","webapp.mySpeedDial"));
  },


//***************************************************************************************//
//SETTINGS
//***************************************************************************************//
  updateAllSettings: function ()
  {
    ICTouchAPI.settingServices.getSetting("mySpeedDialUrl", this,this.getMySpeedDialUrl);
    ICTouchAPI.settingServices.getSetting("mySpeedDialUser", this,this.getMySpeedDialUser);
    ICTouchAPI.settingServices.getSetting("mySpeedDialRefreshTimer", this,this.getMySpeedDialRefreshTimer);
    ICTouchAPI.settingServices.getSetting("mySpeedDialEnablePreview", this,this.getMySpeedDialEnablePreview);
    ICTouchAPI.settingServices.getSetting("mySpeedDialList", this,this.getMySpeedDialList);
    ICTouchAPI.settingServices.getSetting("mySpeedDialAppname", this,this.getMySpeedDialAppname);

    ICTouchAPI.settingServices.subscribeToSetting(this, "mySpeedDialUrl", this.onMySpeedDialUrlChanged);
    ICTouchAPI.settingServices.subscribeToSetting(this, "mySpeedDialUser", this.onMySpeedDialUserChanged);
    ICTouchAPI.settingServices.subscribeToSetting(this, "mySpeedDialRefreshTimer", this.onMySpeedDialRefreshTimerChanged);
    ICTouchAPI.settingServices.subscribeToSetting(this, "mySpeedDialEnablePreview", this.onMySpeedDialEnablePreviewChanged);
    ICTouchAPI.settingServices.subscribeToSetting(this, "mySpeedDialList", this.onMySpeedDialListChanged);
    ICTouchAPI.settingServices.subscribeToSetting(this, "mySpeedDialAppname", this.onMySpeedDialAppnameChanged);

    ICTouchAPI.debugServices.error("webapp.mySpeedDial.settigns - mySpeedDialUrl:" + this.data.mySpeedDialUrl);
    ICTouchAPI.debugServices.error("webapp.mySpeedDial.settigns - mySpeedDialUser:" + this.data.mySpeedDialUser);
    ICTouchAPI.debugServices.error("webapp.mySpeedDial.settigns - mySpeedDialRefreshTimer:" + this.data.mySpeedDialRefreshTimer);
    ICTouchAPI.debugServices.error("webapp.mySpeedDial.settigns - mySpeedDialList:" + this.data.mySpeedDialList);
    ICTouchAPI.debugServices.error("webapp.mySpeedDial.settigns - mySpeedDialList:" + this.data.mySpeedDialAppname);


    //Update App button name
    this.updateApplicationName();
  },
  
  //On Setting changed
  onMySpeedDialUrlChanged : function(objUrl){ if (objUrl) { this.data.mySpeedDialUrl = objUrl.jsValue; }  },
  onMySpeedDialUserChanged: function(objUser){ if(objUser){ this.data.mySpeedDialUser = objUser.jsValue; }  },
  onMySpeedDialRefreshTimerChanged: function(objRefreshTimer){  if(objRefreshTimer){this.data.mySpeedDialRefreshTimer = objRefreshTimer.jsValue;} },
  onMySpeedDialEnablePreviewChanged: function(objEnablePreview) { this.registerHomePageContainer(objEnablePreview); },
  onMySpeedDialListChanged: function(objList){  if(objList){this.data.mySpeedDialList = objList.jsValue;} },
  onMySpeedDialAppnameChanged: function(objAppname){  if(objAppname){this.data.mySpeedDialAppname = objAppname.jsValue; this.updateApplicationName(); } },

  //Get setting
  getMySpeedDialUrl: function(objUrl) { if(objUrl){ this.data.mySpeedDialUrl = objUrl.jsValue; }  },
  getMySpeedDialUser: function(objUser) { if(objUser){ this.data.mySpeedDialUser = objUser.jsValue; } },
  getMySpeedDialRefreshTimer: function(objRefreshTimer) { if(objRefreshTimer){this.data.mySpeedDialRefreshTimer = objRefreshTimer.jsValue;} },
  getMySpeedDialEnablePreview: function(objEnablePreview) { this.registerHomePageContainer(objEnablePreview); },
  getMySpeedDialList: function(objList) { if(objList){this.data.mySpeedDialList = objList.jsValue;} },

  setMySpeedDialList: function(objList) {   
    if(this.data && this.data.mySpeedDialList) {
      this.data.mySpeedDialList = dojo.toJson(objList); 
      ICTouchAPI.settingServices.setSettingValue( "mySpeedDialList", this.data.mySpeedDialList, this);
    }
  },

//***************************************************************************************//

  updateApplicationName : function(){
    if (this.data && this.data.mySpeedDialAppname && this.data.mySpeedDialAppname !==''){
      //Unregister Application
      //ICTouchAPI.tools.unregisterHomepageButton("MYSPEEDDIAL_BTN");
      //ICTouchAPI.tools.unregisterHomepageKey("MYSPEEDDIAL_BTN");

      //Register again
      //ICTouchAPI.tools.registerHomepageButton(["webapp.mySpeedDial.getMainView","MYSPEEDDIAL_BTN","mySpeedDial-application",this.data.mySpeedDialAppname]);
      //ICTouchAPI.tools.registerHomepageKey(["webapp.mySpeedDial.getMainView","MYSPEEDDIAL_BTN","mySpeedDial-application",this.data.mySpeedDialAppname]);
    }
  },

  registerHomePageContainer : function(objSetting)
  {
    if (objSetting){
      if(this.data && this.data.mySpeedDialEnablePreview)
      {
        this.data.mySpeedDialEnablePreview = objSetting.jsValue;
      }
      
      if(objSetting.jsValue === true)
      {
        // if EnableTodoPreview=true, enable the preview
        ICTouchAPI.tools.registerHomepageContainer(["webapp.mySpeedDial.getSpeedDialPreview", this]);
      }
      else
      {
        // else, disable the preview
        ICTouchAPI.tools.unregisterHomepageContainer(["webapp.mySpeedDial.getSpeedDialPreview"]);
      }
    }
  },

  setHomepageContainer : function (strWebapp, div) {
    webapp.mySpeedDial.previewContainer = new webapp.mySpeedDial.getSpeedDialPreview({ }, div);
  },

});
