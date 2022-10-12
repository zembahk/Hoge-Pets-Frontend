import React, { ChangeEvent, FormEvent } from "react";
import { ethers } from 'ethers'

type SubmitEvent = FormEvent<HTMLFormElement>;
type InputEvent = ChangeEvent<HTMLInputElement>;

type Props = {
  setValid: (val: boolean) => void;
  setSomeMsg: (val: string) => void;
  holderAddress: string;
  setHolderAddress: (val: string) => void;
  handleOnSubmit: (e: SubmitEvent) => void;
};

const InputForm: React.FC<Props> = ({
  setValid,
  setSomeMsg,
  holderAddress,
  setHolderAddress,
  handleOnSubmit,
}) => {
     
  const handleClick = async (_someVar: any, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log(_someVar, e)
  };

  const handleHolderInputChange = async (e: InputEvent) => {
    e.preventDefault();
    if (!ethers.utils.isAddress(e.target.value) ) { setValid(false); setSomeMsg('Need Valid Address') } 
    setHolderAddress(e.target.value)
  }
  
  return (
    <>
      <form onSubmit={handleOnSubmit}>
      <label htmlFor="holderAdress">Holder Address</label>
        <input
          id="holderAdress"
          className="address"
          placeholder="Holder Address"
          value={holderAddress}
          onChange={handleHolderInputChange}
          type="text"
        />
        <p />
        <button className="get" onClick={(e) => handleClick('event info:', e)}>
          Get List
        </button> 
      </form>
    </>
  );
};

export default InputForm;