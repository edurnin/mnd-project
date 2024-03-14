// FILEPATH: /Users/PC/Documents/Year4/Final Project/mnd-project/src/components/PatientSearch.test.js

import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import PatientSearch from './components/PatientSearch';
import { act } from 'react-dom/test-utils';

// Mocking the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([{ group: '1', group_series_2: 'Test', group_series_5: '2022-01-01', group_series_7: 'scored', group_series_12: '1|2|3' }]),
  })
);

beforeEach(() => {
  fetch.mockClear();
});

test('renders PatientSearch component', () => {
  render(<PatientSearch patientNamesandIDs={[]} />);
});

test('handleFormSubmit function works correctly', async () => {
  const { getByText, getByLabelText } = render(<PatientSearch patientNamesandIDs={[{ "First Name": "John", "Last Name": "Doe", ID: "1" }]} />);
  
  fireEvent.change(getByLabelText(/First Name/i), { target: { value: 'John' } });
  fireEvent.change(getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
  
  fireEvent.submit(getByText('Submit'));
  
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
});

test('handlePatientClick function works correctly', async () => {
  const { getByText } = render(<PatientSearch patientNamesandIDs={[{ "First Name": "John", "Last Name": "Doe", ID: "1" }]} />);
  
  fireEvent.click(getByText('John Doe'));
  
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
});

test('fetchQuestionnaireResponses function works correctly', async () => {
  const { getByText } = render(<PatientSearch patientNamesandIDs={[{ "First Name": "John", "Last Name": "Doe", ID: "1" }]} />);
  
  fireEvent.click(getByText('John Doe'));
  
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  
  expect(getByText('Responses for John Doe')).toBeInTheDocument();
  expect(getByText('Questionnaire: Test')).toBeInTheDocument();
});