import React, { useState } from 'react';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';

export default function AddComponentBasicMenu({onCreateClick, componentOptions}){

    // const [component, setComponent] = useState("");
    const [filteredComponents, setFilteredComponents] = useState(componentOptions);//componentOptions);
    const [searchStr, setSearchStr] = useState(null);//componentOptions);

    const handleFilter = (event) => {
        const value = event.target.value;
        const filtered = componentOptions.components.filter(comp => comp.name.includes(value.toLowerCase()));
        setFilteredComponents(filtered);
        setSearchStr(event.target.value);
    };

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

    return (
        <div className="inline-flex text-success p-2" >

            <Menu as="div" className="relative inline-block text-left">
                <div>
                    <Menu.Button className="btn btn-ghost btn-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                             stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                        </svg>
                        <div className="pl-2">add component</div>
                    </Menu.Button>
                </div>

                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items
                        className="absolute right-0 z-10 mt-2 w-56 origin-left divide-y divide-gray-100 rounded bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">

                        {/*Search Bar*/}
                        <div className="relative mr-6 my-2 px-2 py-3">
                            <input onChange={handleFilter} type="search"
                                   className="bg-purple-white border-0 border-bottom p-3"
                                   placeholder="Search by name..."/>
                            <div className="absolute right-6 top-0 mt-3 mr-4 text-purple-lighter">
                                {searchStr === null ? <svg xmlns="http://www.w3.org/2000/svg"
                                                           className="w-4 h-4" x="0px" y="0px"
                                                           viewBox="0 0 512 512" xmlSpace="preserve">
                                    <path
                                        d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
                                </svg> : null}
                            </div>
                        </div>

                        {/*Menu options*/}
                        <div className="py-1 px-2">
                            {filteredComponents.map((item, index) => {
                                return (<Menu.Item key={'component-' + index}>
                                    {({active}) => (
                                        <div onClick={onCreateClick} data-value={JSON.stringify(item)}
                                             className={classNames(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', ' group flex items-center px-4 py-2 text-sm h-12 capitalize cursor-pointer')}>
                                            <img src={'../../../images/' + item.name + '.icon.png'}
                                                 className="w-8 mr-2"/>
                                            {item.name}
                                        </div>
                                    )}
                                </Menu.Item>);
                            })}
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    );
}
