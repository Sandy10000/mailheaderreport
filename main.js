import{getHeaderDetails}from './header.js'
import{report}from './report.js'

// The mailTabs API first appeared in Thunderbird 66 and allows to interact with Thunderbirds main mail window.
// getSelectedMessages([tabId])    Required permissions    messagesRead
const messagesList=await browser.mailTabs.getSelectedMessages()

if(messagesList.messages.length!=1)document.body.innerText=browser.i18n.getMessage('oneEmail')
else{

    // The messages API first appeared in Thunderbird 66.
    // The permission messagesRead is required to use messenger.messages.*.
    const message=await messenger.messages.getFull(messagesList.messages[0].id)

    report(getHeaderDetails(message.headers))
}