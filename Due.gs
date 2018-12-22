function onOpen(e) {
  //DocumentApp.getUi().createAddonMenu().addItem('Go!', 'showDialog').addToUi();
  DocumentApp.getUi().createAddonMenu().addItem('Go!', 'showSidebar').addToUi();
}

function onInstall(e) {
  var today = new Date();
  //saveText(today.getTime());
  onOpen(e);
}

function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('Sidebar')
      .setTitle('Due');
  DocumentApp.getUi().showSidebar(ui);
}
