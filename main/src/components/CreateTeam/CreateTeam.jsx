import toast from 'react-hot-toast';
import Button from '../../components/Button/Button';
import { AppContext } from '../../context/AppContext';
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkTeamNameExists, createNewTeam } from '../../services/teams.service';
import { createChannel } from '../../services/channel.service';
import { getAllUsers } from '../../services/users.service';
import './CreateTeam.css'

export default function CreateTeam({ toggleShowCreateTeam }) {
  const navigate = useNavigate();
  const { userData } = useContext(AppContext);

  const [form, setForm] = useState({
    teamName: '',
    teamOwner: '',
    teamMembers: [],
    teamChannels: [],
  });

  useEffect(() => {
    if (userData) {
      setForm(prevForm => ({
        ...prevForm,
        teamOwner: userData.username,
        teamMembers: [userData.username],
      }));
    }
  }, [userData]);

  const teamNameHandler = (event) => {
    setForm(prevForm => ({ ...prevForm, teamName: event.target.value }));
  };

  const createTeam = async () => {
    if (
      form.teamName.length < 3 ||
      form.teamName.length > 40
    ) {
      toast.error('Name must be between 3 and 40 symbols.');
      return;
    }

    const teamNameExists = await checkTeamNameExists(form.teamName);

    if (teamNameExists) {
      toast.error(`The team name ${form.teamName} already exists.`);
      return;
    }

    try {
      const newTeamRef = await createNewTeam(form.teamName, form.teamOwner, form.teamMembers, form.teamChannels);
      const teamId = newTeamRef.key;
      const initialChat = {
        text: `Welcome to the General channel!`,
        sender: form.teamOwner,
        timeStamp: Date.now(),
      };
      await createChannel(teamId, form.teamOwner, 'General', initialChat, form.teamMembers, false);
      toast.success(`Team ${form.teamName} created successfully.`);
      toggleShowCreateTeam();
    } catch (error) {
      toast.error(error.message);
    }
  };

    const handleAddUser = (username) => {
      if (username && username.trim() !== "") {
        setForm(prevForm => ({
          ...prevForm,
          teamMembers: [...prevForm.teamMembers, username]
        }));
        toast.success(`User ${username} added to team`);
      }
    };


    const [searchInput, setSearchInput] = useState('');

    const [searchResults, setSearchResults] = useState([]);

    const [searchPerformed, setSearchPerformed] = useState(false);

  
    const updateFormSearch = e => {
      setSearchInput(e.target.value)
    }

  const searchUsers = async () => {
    const allUsers = await getAllUsers();
    const filteredUsers = allUsers.filter(user => user.username.startsWith(searchInput));
    return filteredUsers;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const results = await searchUsers();
    setSearchResults(results);
    setSearchPerformed(true);
  }

  useEffect(() => {
    if (searchInput === '') {
      setSearchPerformed(false);
    }
  }, [searchInput]);

  return (
    <>
      <div className="create-team">
        <h3 className="create-team-head">Make you own Team</h3>
        <div className="team-name">
          <form>
            <div className="team-name-input">
              <input placeholder='Your new team name' className='create-team-name-input' onChange={teamNameHandler} type="text" />
            </div>
            <button title="create-team-btn" className='create-team-button' onClick={(event) => { event.preventDefault(); createTeam(); }}>Create Team</button>
          </form>
        </div>
        <form className="add-team-memberes-create-form" onSubmit={handleSubmit}>
        <h3 className="search-users-create-head">Add users</h3>
        <input autoComplete="off" className="form-control-create-team"
          type="text" placeholder='Search by username'
          value={searchInput} onChange={updateFormSearch} />
        <button className="search-button-create-team" onClick={handleSubmit}>Search</button>
        <div className="search-results-create-team">
          {searchResults.map((user, index) => (
            <div className="search-results-item-create-team" key={index}>
              <div className="user-info-create-team">
                {user.username}
              </div>
              <div className="use-actions-create-team">
                <button className='add-button-new-team' onClick={() => handleAddUser(user.username)}>Add</button>
              </div>
            </div>
          ))}
        </div>
      </form>
      </div>
    </>
  );
}