import React from 'react'
import RoomItem from './RoomItem'

const ListRooms = ({ rooms }) => {
    return (
        <div className='ml-2 mt-2'>
            {rooms?.map((room) => (
                <RoomItem room={room} key={room._id} />
            ))}
        </div>
    )
}

export default ListRooms