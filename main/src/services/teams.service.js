import { db } from '../config/firebase-config';
import { ref, get, set, push, onValue, remove } from 'firebase/database';


export const checkTeamNameExists = async (teamName) => {
  const teams = await getAllTeams();

  return teams.some((team) => team.teamName === teamName);
}

export const getTeamById = async (id) => {
    const snapshot = await get(ref(db, `teams/${id}`));
    if (!snapshot.exists()) {
      return null;
    }
  
    const team = {
      id,
      ...snapshot.val(),     
    };
  
    return team;
  };


  export const getTeamMembers = async (teamId) => {
    const snapshot = await get(ref(db, `teams/${teamId}/members`));
    if (!snapshot.exists()) {
      return null;
    }
  
    const members = snapshot.val();
  
    return members;
};

export const getAllTeams = async () => {
    const teams = get(ref(db, `teams`));
    const snapshot = await teams;

    try{
        if (snapshot.exists()) {
            return Object.values(snapshot.val());
        } else {
            return [];
        }
    } catch (error) {
        console.error(error);
    }
}

export const getAllTeamsNames = async () => {
  const teams = get(ref(db, `teams`));
  const snapshot = await teams;

  try{
      if (snapshot.exists()) {
          const teams = Object.values(snapshot.val());
          const teamNames = teams.map(team => team.teamName); // replace 'name' with the actual property name
          return teamNames;
      } else {
          return [];
      }
  } catch (error) {
      console.error(error);
  }
}

export const createNewTeam = async (teamName, teamOwner, teamMembers, teamChannels) => {
    const newTeamRef = push(ref(db, 'teams'));
    //const teamId = newTeamRef.key;

    await set(newTeamRef, { teamId: newTeamRef.key, teamName, teamOwner, teamMembers, teamChannels });

    return newTeamRef;
};

export const addUserToTeam = async (teamId, username) => {
  const teamMembers = await getTeamMembersByTeamId(teamId);
    return set(ref(db, `teams/${teamId}/teamMembers`), [...teamMembers, username]);
};

export const removeUserFromTeam = async (teamId, username) => {
  const teamMembers = await getTeamMembersByTeamId(teamId);
    return set(ref(db, `teams/${teamId}/teamMembers`), teamMembers.filter(member => member !== username));
};

export const getAllTeamMembers = async (team) => {
    return get(ref(db, `teams/${team.key}/teamMembers`));
};


export async function getTeamMembersByTeamId(teamId) {
  const teamMembersRef = ref(db, `teams/${teamId}/teamMembers`);

  return new Promise((resolve, reject) => {
    onValue(teamMembersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        resolve([]);
        return;
      }

      // If data is an array of team members, resolve it directly
      resolve(data);
    }, (error) => {
      reject(error);
    });
  });
}

export const getTeamOwner = async (teamId) => {
  const snapshot = await get(ref(db, `teams/${teamId}/teamOwner`));
  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.val();
}

export const getTeamIdByTeamName = async (teamName) => {
  const teams = await getAllTeams();

  const matchingTeam = teams.find(team => team.teamName === teamName);

  return matchingTeam ? matchingTeam.teamId : null;
}

export const deleteTeam = async (teamId) => {
  try {
      await remove(ref(db, `teams/${teamId}`));
  } catch (error) {
      console.error("Failed to delete team", error);
  }
};