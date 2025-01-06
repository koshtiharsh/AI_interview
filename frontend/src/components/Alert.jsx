import { useContext } from "react"
import { context } from "../context/Context"

export default function Alert({ setModel }) {
    const { ans, setAns } = useContext(context)
    return (
        <div className=' absolute h-[100%] w-[100%] bg-gray-500 bg-opacity-20 z-50' >
            <div className='alert  fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white  py-4 px-5 flex flex-col gap-3'>

                <h1>Do you want add something ?</h1>
                <div
                    className='flex justify-evenly gap-5'>
                    <button className='bg-blue-400 p-1 font-medium text-white rounded-md px-2' onClick={() => {
                        setModel(false)
                        setAns('yes')
                    }}>Yes</button>
                    <button className='bg-blue-400 p-1 font-medium text-white rounded-md px-2' onClick={() => setAns('no')}>No</button>
                </div>
            </div>

        </div>
    )
};