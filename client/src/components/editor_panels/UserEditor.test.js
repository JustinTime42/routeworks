import {shallow} from 'enzyme'
import React from 'react'
import UserEditor from './UserEditor'

it('expects to render UserEditor component', () => {
    expect(shallow(<UserEditor />)).toMatchSnapshot()
})