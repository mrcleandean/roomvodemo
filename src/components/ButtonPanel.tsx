import { FC, useState } from "react";
import Button from "./Button";
import { Check, HouseSimple, Pause, ShareNetwork } from "@phosphor-icons/react";
import ExitButton from "./ExitButton";
import { Room } from "../App";

type ButtonPanelProps = {
    viewing: boolean;
    toggleView: () => void;
    rooms: Room[];
    current: number;
}

const ButtonPanel: FC<ButtonPanelProps> = ({ viewing, toggleView, rooms, current }) => {
    const [copied, setCopied] = useState(false);
    return (
        <div className="absolute z-[2] left-1/2 -translate-x-1/2 top-0 rounded-b-[16px] p-[8px] overflow-hidden">
            <div className="relative z-[1] flex gap-2">
                {viewing ? (
                    <Button
                        onClick={toggleView}
                        text="DONE"
                        Symbol={Check}
                    />
                ) : (
                    <>
                        <ExitButton />
                        <Button
                            onClick={toggleView}
                            text="CHANGE ROOM"
                            Symbol={HouseSimple}
                        />
                        <Button
                            onClick={toggleView}
                            text="VIEWS"
                            Symbol={Pause}
                        />
                        <Button
                            onClick={() => {
                                navigator.clipboard.writeText(rooms[current].src);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 1500); // TODO: Add unmount cleanup
                            }}
                            text={copied ? 'COPIED' : 'SHARE'}
                            Symbol={ShareNetwork}
                        />
                    </>
                )}
            </div>
            <div className="absolute inset-0 z-0 opacity bg-[#303438] opacity-55" />
        </div>
    )
}

export default ButtonPanel;