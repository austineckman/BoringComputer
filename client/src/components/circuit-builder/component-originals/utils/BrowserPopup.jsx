import {Fragment, useEffect, useState} from 'react'
import {Popover, Transition} from "@headlessui/react";

const BrowserPopup = () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => {
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        const isChrome = navigator.userAgent.includes("Chrome");
        if (!isChrome) {
            setIsOpen(true);
        }
    }, []);

    return (
        <Popover className="isolate z-top">
            <Transition
                show={isOpen}
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 -translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 -translate-y-1"
            >
                <Popover.Panel
                    className="absolute left-0 -z-10 bg-white rounded-lg pt-4 pb-4 shadow-xl m-4">

                    <Popover.Button
                        className="btn btn-circle btn-outline btn-sm absolute top-2 right-2 px-0"
                        onClick={handleClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </Popover.Button>

                    <div
                        className="mx-auto grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-10 lg:grid-cols-2 lg:px-8">
                        <div className="p-4">
                            <h1 className="font-sans font-bold text-xl">This app is best experienced in Chrome</h1>
                            <p>
                                For the best experience, please use Google Chrome. Chrome is the
                                only browser that supports all of the features of this app.
                            </p>
                            <div className="flex flex-row space-x-2 justify-end pt-6">
                                <button className="btn btn-active btn-primary" onClick={handleClose}>Ok</button>
                            </div>

                        </div>
                    </div>
                </Popover.Panel>
            </Transition>
        </Popover>
    );
};

export default BrowserPopup;
