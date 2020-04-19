const users = []

const addUSer = ({id, username, room})=>{
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if(!username || !room){
        return {
            error: 'Username and room are required'
        }
    }

    //Check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    //Validate username
    if(existingUser){
        return {
            error: 'Username is in use!'
        }
    }

    //Store user
    const user = {id, username, room}
    users.push(user)

    return {user}
}

const removeUser = (id)=>{
    const index = users.findIndex((user)=>{
        return user.id === id
    })

    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id)=>{
   const userById = users.find((user)=>{
        return user.id === id
    })

    return userById
}

const getUserInRoom = (room)=>{
   const allUsersByRoom =  users.filter((user)=>{
        return user.room === room
    })

    return allUsersByRoom
}

module.exports = {
    addUSer,
    removeUser,
    getUser,
    getUserInRoom
}