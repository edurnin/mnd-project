const carerQuestionMapping = [
    ['How many hours of care do you provide per day?', 'value of response'], // Question 1 options
    ['Do you have any external help coming in? ', 'yes', 'no'], // Question 2 options
    ['IF YES: How many hours?', 'value of response'],  // Question 3 options
    ['Has this number of hours changed since last month?', 'Yes increased', 'Yes decreased', 'no'],  // Question 4 options
    ['Do you have adequate carer support hours?', 'Yes, we are managing ', 'No, we need additional help if possible'],  // Question 5 options
    ['Is the home environment suitable for the needs of your family member?', 'yes', 'no'],  // Question 6 options
    ['What would help you at the moment?', 'open text'],  // Question 7 options
    ['Have you noticed any recent changes in your loved ones cognition or behaviour?', 'yes', 'no'],  // Question 8 options
    ['Can you tell us briefly about these changes?', 'free text'],  // Question 9 options
    ['Would you like to discuss emotional supports available for carers? ', 'yes', 'no'],  // Question 10 options
    
];

export default carerQuestionMapping;