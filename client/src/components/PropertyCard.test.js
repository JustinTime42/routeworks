import React from 'react'
import { shallow, mount, render } from 'enzyme'
import PropertyCard from './PropertyCard'


it('expect to render property card', () => {
    expect(shallow(<PropertyCard />).length).toEqual(1)
})

