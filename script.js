const newPartyForm = document.querySelector('#new-party-form');
const partyContainer = document.querySelector('#party-container');

const PARTIES_API_URL =
  'http://fsa-async-await.herokuapp.com/api/workshop/parties';
const GUESTS_API_URL =
  'http://fsa-async-await.herokuapp.com/api/workshop/guests';
const RSVPS_API_URL = 'http://fsa-async-await.herokuapp.com/api/workshop/rsvps';
const GIFTS_API_URL = 'http://fsa-async-await.herokuapp.com/api/workshop/gifts';

const getAllParties = async () => {
  try {
    const response = await fetch(PARTIES_API_URL);
    const parties = await response.json();
    return parties;
  } catch (error) {
    console.error(error);
  }
};

const getPartyById = async (id) => {
  try {
    const response = await fetch(`${PARTIES_API_URL}/${id}`);
    const party = await response.json();
    return party;
  } catch (error) {
    console.error(`Error when getPartyByID`, error);
  }
};

const getPartyGuestsById = async (id) => {
  try {
    const response = await fetch(`${GUESTS_API_URL}/${id}`);
    const guests = await response.json();
    return guests;
  } catch (error) {
    console.error(`Error in getPartyGuestsById: `, error)
  }
}

const deleteParty = async (id) => {
  try {
    const response = await fetch(`${PARTIES_API_URL}/${id}`, {
      method: "DELETE"
    });
    const data = await response.json();
  } catch (error) {
    console.log(`Error deleting part`, error)
  }
};

const renderSinglePartyById = async (id) => {
  try {
    const party = await getPartyById(id);

    const guestsResponse = await fetch(`${GUESTS_API_URL}/party/${id}`);
    const guests = await guestsResponse.json();

    const rsvpsResponse = await fetch(`${RSVPS_API_URL}/party/${id}`);
    const rsvps = await rsvpsResponse.json();
    const partyDetailsElement = document.createElement('div');
    partyDetailsElement.classList.add('party-details');
    console.log(party);
    partyDetailsElement.innerHTML = `
            <h2>${party.name}</h2>
            <p>${party.description}</p>
            <p>${party.location}</p>
            <p>${party.time}</p>
            <p>${party.date}</p>
            <h3>Guests:</h3>
            <ul>
            ${guests
              .map(
                (guest, index) => `
              <li>
                <div>${guest.name}</div>
                <div>${rsvps[index].status}</div>
              </li>
            `
              )
              .join('')}
          </ul>
          


            <button class="close-button">Close</button>
        `;
    partyContainer.appendChild(partyDetailsElement);

    const closeButton = partyDetailsElement.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
      partyDetailsElement.remove();
    });
  } catch (error) {
    console.error(error);
  }
};

const renderParties = async (parties) => {
  try {
    partyContainer.innerHTML = '';
    parties.forEach((party) => {
      const partyElement = document.createElement('div');
      partyElement.classList.add('party');
      partyElement.innerHTML = `
                <h2>${party.name}</h2>
                <p>${party.description}</p>
                <p>${party.date}</p>
                <p>${party.time}</p>
                <p>${party.location}</p>
                <button class="details-button" data-id="${party.id}">See Details</button>
                <button class="delete-button" data-id="${party.id}">Delete</button>
            `;
      partyContainer.appendChild(partyElement);

      const detailsButton = partyElement.querySelector('.details-button');
      detailsButton.addEventListener('click', async (event) => {
        event.preventDefault();
        const partyId = event.target.dataset.id;
        detailsElement = document.createElement(`div`);
        partyElement.appendChild(detailsElement)
        detailsElement.innerHTML = `Guests: ${await getPartyGuestsById(partyId)}`;
      });

      const deleteButton = partyElement.querySelector('.delete-button');
      deleteButton.addEventListener('click', async (event) => {
        const partyId = event.target.dataset.id;
        await deleteParty(partyId);

        const partyList = await getAllParties();
        renderParties(partyList);
      });
    });
  } catch (error) {
    console.error(error);
  }
};

const renderNewPartyForm = () => {
  newPartyForm.innerHTML = `
  <form>
    <label for="name">Party Name: </label>
    <input type="text" id="name" name="name" required>
    <label for="date">Date: </label>
    <input type="date" id="date" name="date" required>
    <label for="time">Time: </label>
    <input type="time" id="time" name="time" required>
    <label for="location">Location: </label>
    <input type="text" id="location" name="location" required>
    <label for="description">Description: </label>
    <textarea id="description" name="description"></textarea>
    <button type="submit">Create New Party</button>
  </form>
  `;

  const partyForm = newPartyForm.querySelector(`form`);
  
  partyForm.addEventListener(`submit`, submitHandler);


}

const createParty = async (party) => {
  try {
    const response = await fetch(PARTIES_API_URL, {
      method: "POST",
      body: JSON.stringify(party),
      headers: {
        "Content-Type" : "application/json"
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }

}

const submitHandler = async (event) => {
  event.preventDefault();
  const form = event.target;

  const name = form.name.value;
  const date = form.date.value;
  const time = form.time.value;
  const location = form.location.value;
  const description = form.description.value;

  const data = await createParty({
    name,
    date,
    time,
    location,
    description,
  });

  if (data) {
    alert(`${data.name} was created with ID: ${data.id}`)
  }

  const parties = await getAllParties();
  renderParties(parties);

  form.name.value = ``;
  form.date.value = ``;
  form.time.value = ``;
  form.location.value = ``;
  form.description.value = ``;
}

const init = async () => {
  parties = await getAllParties();
  renderParties(parties);
  renderNewPartyForm();
};

init();
