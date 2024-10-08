import React, { useState, useEffect } from 'react'
import * as api from '../services'
import RoomItem from './RoomItem'
import { apiGetAllRoom } from '../services'
const ListRooms = (props) => {
    // const [rooms, setRooms] = useState([])
    
    // const getdataRooms = async () => {
    //     const data = await apiGetAllRoom()
    //     setRooms(data.data)
    // };
    // useEffect(() => {
    //     getdataRooms()
    // }, [])

    return (
        <div className='ml-2 mt-2'>
            {props.rooms?.map((room) => (
                <RoomItem room={room} key={room._id}/>
            ))}
        </div>
    )
}

export default ListRooms