/**
 * Creates the "Online fashion shopping and wishlists" research form in your Google account.
 * How to run: script.google.com > New project > paste this file > Run "createForm" > Allow access.
 * The form links appear in View > Logs (or Executions) after it finishes.
 */
function createForm() {
  var form = FormApp.create('Online fashion shopping and wishlists (5 min)');
  form.setDescription(
    'I am doing a student research project on how people use wishlists in fashion apps. ' +
    'Please answer about ONE real item you saved but did not buy. There are no right or wrong answers. ' +
    'Your answers are used only for this project. Name and contact details are optional.');
  form.setCollectEmail(false);
  form.setProgressBar(true);

  // --- Section 1: you
  form.addPageBreakItem().setTitle('About you');
  form.addMultipleChoiceItem().setTitle('Which fashion app do you use most?')
    .setChoiceValues(['Myntra', 'Ajio', 'Nykaa Fashion', 'Amazon / Flipkart', 'Meesho', 'Other']).showOtherOption(true).setRequired(true);
  form.addMultipleChoiceItem().setTitle('Your age group')
    .setChoiceValues(['18-22', '23-28', '29-35', '36-45', '46+']).setRequired(true);
  form.addMultipleChoiceItem().setTitle('Where do you live?')
    .setChoiceValues(['Metro city', 'Tier-2 city', 'Tier-3 town or smaller']).setRequired(true);
  form.addMultipleChoiceItem().setTitle('How often do you save items to a wishlist?')
    .setChoiceValues(['Almost every visit', 'Monthly', 'Rarely', 'Never']).setRequired(true);

  // --- Section 2: one real item
  form.addPageBreakItem().setTitle('One saved item')
    .setHelpText('Open your wishlist and pick ONE item you saved but have not bought yet.');
  form.addTextItem().setTitle('What is the item? (for example: black sneakers, floral kurta)').setRequired(true);
  form.addCheckboxItem().setTitle('Why did you save it instead of buying right away?')
    .setChoiceValues(['Waiting for a sale or price drop', 'Budget not available now', 'Saving for an occasion or later',
      'Want to compare with other items', 'Not sure about size or fit', 'Not sure about quality', 'Just browsing or bookmarking'])
    .showOtherOption(true).setRequired(true);
  form.addMultipleChoiceItem().setTitle('Do you still plan to buy it?')
    .setChoiceValues(['Yes, soon', 'Maybe, not sure', 'No, not anymore', 'I already bought it (here or elsewhere)']).setRequired(true);

  // --- Section 3: doubts
  form.addPageBreakItem().setTitle('What is stopping you');
  form.addCheckboxItem().setTitle('What has stopped you from buying it so far?')
    .setChoiceValues(['Price is too high / waiting for a sale', 'Budget not available right now', 'Not sure about size or fit',
      'Not sure about quality or fabric', 'Reviews are not enough or not trustworthy', 'Worried about returns or refunds',
      'Not sure the product is authentic', 'Comparing with other apps or shops', 'Delivery time or cost', 'No occasion yet',
      'Out of stock in my size', 'Forgot about it'])
    .showOtherOption(true).setRequired(true);
  form.addParagraphTextItem().setTitle('In your own words, what is the MAIN thing stopping you from buying it?').setRequired(true);
  form.addParagraphTextItem().setTitle('What would you still want to know before buying it?');
  form.addScaleItem().setTitle('How worried are you about returning this item or getting a refund if something goes wrong?')
    .setBounds(1, 5).setLabels('Not worried', 'Very worried').setRequired(true);
  form.addParagraphTextItem().setTitle('What would a "good enough" review look like for you? (for example photos, someone with my size, honest negatives)');

  // --- Section 4: outside the app
  form.addPageBreakItem().setTitle('Before you decide');
  form.addCheckboxItem().setTitle('Where do you look for more information before buying? (choose all that apply)')
    .setChoiceValues(['Product reviews in the app', 'YouTube / Instagram', 'Friends and family', 'Other shopping apps (price check)',
      'Visit a shop to see or try it', 'Google search']).showOtherOption(true).setRequired(true);
  form.addMultipleChoiceItem().setTitle('Have you looked for the same or a similar item on another app or shop?')
    .setChoiceValues(['Yes', 'No']).setRequired(true);
  form.addParagraphTextItem().setTitle('If yes, where, and what did you find? (optional)');
  form.addParagraphTextItem().setTitle('How do you usually get past a doubt about an item like this, so you feel sure enough to buy?').setRequired(true);
  form.addParagraphTextItem().setTitle('What ONE thing would make you more likely to buy this saved item? (no discounts, please)').setRequired(true);

  // --- Section 5: optional follow-up
  form.addPageBreakItem().setTitle('Optional')
    .setHelpText('Only if you are happy to talk for 10 minutes about your wishlist. No payment or reward is offered.');
  form.addTextItem().setTitle('Your first name (optional)');
  form.addTextItem().setTitle('Phone or email if you are open to a short call (optional)');

  form.setConfirmationMessage('Thank you. Your answers help me understand how people decide on fashion purchases.');

  Logger.log('Edit link (yours): ' + form.getEditUrl());
  Logger.log('Share link (send to respondents): ' + form.getPublishedUrl());
}
