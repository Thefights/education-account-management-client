import { FloatButton, Popover } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { RobotOutlined } from '@ant-design/icons';
import { AIChatbox } from '../Chatbox/AIChatbox';

export const AIPopover = () => {
    const [open, setOpen] = useState(false)
    const [position, setPosition] = useState({
        x: window.innerWidth,
        y: window.innerHeight
    })

    const dragging = useRef(false)
    const offset = useRef({ x: 0, y: 0 })

    const handleMouseDown = (e) => {
        dragging.current = true
        offset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        }
    }

    const handleMouseMove = (e) => {
        if (!dragging.current) return
        setOpen(false);
        dragging.moving = true;
        var x = e.clientX - offset.current.x;
        var y = e.clientY - offset.current.y;
        if (e.clientX <= 0) {
            console.log("Near left border");
            x = 0;
        } else if (e.clientX >= window.innerWidth - 0) {
            console.log("Near right border");
            x = window.innerWidth - 0;
        } else if (e.clientY <= 0) {
            console.log("Near top border");
            y = 0;
        } else if (e.clientY >= window.innerHeight - 0) {
            console.log("Near bottom border");
            y = window.innerHeight;
        }
        else {
            x = e.clientX - offset.current.x
            y = e.clientY - offset.current.y
        }
        
        setPosition({
            x: x,
            y: y
        })
    }

    const Toggling = () => {
        if(!dragging.moving) setOpen((prev) => (!prev))
        else dragging.moving = false;
    }

    const handleMouseUp = () => {
        dragging.current = false
        setPosition({
            x: window.innerWidth,
            y: window.innerHeight
        })
    }

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [])

    useEffect(() => {
        console.log(position)
    }, [position])

    return (
        <div
            style={{
                position: 'absolute',
                left: position.x,
                top: position.y,
                zIndex: '9999',
                transition: `left ${dragging.current ? 0 : 0.7}s ease-out, top ${dragging.current ? 0 : 0.7}s ease-out`
            }}
        >
            <Popover content={<AIChatbox />} open={open} placement='leftTop' color="none">
                <FloatButton icon={<RobotOutlined />} style={{ position:'absolute', width: '5rem', height: '5rem' }} onClick={Toggling} onMouseDown={handleMouseDown}/>
            </Popover>
        </div>
    )
}