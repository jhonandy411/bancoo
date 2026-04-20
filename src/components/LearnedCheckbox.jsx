import React, { useState } from 'react';

const LearnedCheckbox = () => {
    const [checked, setChecked] = useState(false);

    const toggleCheckbox = () => {
        setChecked(!checked);
        console.log('Learned checkbox toggled:', !checked);
    };

    return (
        <div className="_7a37f680f120945d--checkboxContainer" role="button" onClick={toggleCheckbox}>
            <div className="css-1672r5k-StyledFormField e1uawe9k0">
                <div className="css-bkwbtj-StackContainer e7wwwvf0">
                    <div className="css-10ts8ay-StackItem e7wwwvf1">
                        <label style={{ cursor: 'pointer' }}>
                            <div className="css-bkwbtj-StackContainer e7wwwvf0">
                                <div className="css-1mpk5ch-StackItem e7wwwvf1">
                                    <div className="css-nuxaj3-StyledCheckboxContainer eify5ws3">
                                        <div className="css-6ye7h4-InlineContainer e6i75dx0">
                                            <div className="css-h0nko7-StyledInlineItem e6i75dx1">
                                                <div className="css-ynjq41-StyledInputContainer eify5ws0">
                                                    <input
                                                        name="learned-checkbox"
                                                        type="checkbox"
                                                        className="css-oww8b1-StyledRealInput eify5ws1"
                                                        checked={checked}
                                                        readOnly
                                                    />
                                                    <span className="css-1rvd4z6-StyledFakeInput eify5ws2">
                                                        <div color="inherit" className={`css-cjtild-StyledIcon e1kkd7uc0 ${checked ? '' : 'hidden'}`} style={{ opacity: checked ? 1 : 0 }}>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="16"
                                                                height="16"
                                                                fill="none"
                                                                viewBox="0 0 16 16"
                                                            >
                                                                <path
                                                                    stroke="currentColor"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="m14 4-8.25 8L2 8.364"
                                                                ></path>
                                                            </svg>
                                                        </div>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="css-h0nko7-StyledInlineItem e6i75dx1">
                                                <div>
                                                    <p className="css-den2g6-StyledText eadloo90">Learned</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LearnedCheckbox;
