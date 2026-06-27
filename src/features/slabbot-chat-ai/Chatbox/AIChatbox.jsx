import { Flex, FloatButton, Popover } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { RobotOutlined } from '@ant-design/icons';
import './AIChatbox.css'
import { theme } from 'antd';

export const AIChatbox = () => {
    const { token } = theme.useToken();
    return (
        <div id="botchatbox" style={{background:token.colorBgContainer}}>
            <Flex vertical>
                <div id="botheader"></div>
                <div id="botchatlog">
                    <Flex vertical style={{background:token.colorBgSolid, height:'100px'}}>
                        
                    </Flex>
                </div>
            </Flex>
        </div>
    )
}