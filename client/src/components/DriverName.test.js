import React from 'react'
import { shallow, mount, render } from 'enzyme'
import DriverName from './DriverName'

it('correctly sets driver name', () => {
    expect(shallow(<DriverName />).find('[id="changeDriverName"]')).simulate('onChange')
})