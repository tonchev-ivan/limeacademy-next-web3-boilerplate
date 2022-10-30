import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import useUSElectionContract from "../hooks/useUSElectionContract";

type USContract = {
  contractAddress: string;
};

export enum Leader {
  UNKNOWN,
  BIDEN,
  TRUMP
}

const USLibrary = ({ contractAddress }: USContract) => {
  const { account, library } = useWeb3React<Web3Provider>();
  const usElectionContract = useUSElectionContract(contractAddress);
  const [currentLeader, setCurrentLeader] = useState<string>('Unknown');
  const [name, setName] = useState<string | undefined>();
  const [votesBiden, setVotesBiden] = useState<number | undefined>();
  const [votesTrump, setVotesTrump] = useState<number | undefined>();
  const [stateSeats, setStateSeats] = useState<number | undefined>();
  const [seatsBiden, setSeatsBiden] = useState<number | undefined>();
  const [seatsTrump, setSeatsTrump] = useState<number | undefined>();
  const [electionState, setElectionState] = useState<string>('Unknown');

  useEffect(() => {
    getCurrentLeader();
    getSeats();
    getElectionState();
  }, [])

  const getCurrentLeader = async () => {
    const currentLeader = await usElectionContract.currentLeader();
    setCurrentLeader(currentLeader == Leader.UNKNOWN ? 'Unknown' : currentLeader == Leader.BIDEN ? 'Biden' : 'Trump')
  }

  const getSeats = async () => {
    const seatsBiden = await usElectionContract.seats(1);
    const seatsTrump = await usElectionContract.seats(2);
    setSeatsBiden(seatsBiden);
    setSeatsTrump(seatsTrump);
  }

  const getElectionState = async () => {
    const electionState = await usElectionContract.electionEnded();
    setElectionState(electionState ? "Election Ended" : "Election Ongoing");
  }

  const stateInput = (input) => {
    setName(input.target.value)
  }

  const bideVotesInput = (input) => {
    setVotesBiden(input.target.value)
  }

  const trumpVotesInput = (input) => {
    setVotesTrump(input.target.value)
  }

  const seatsInput = (input) => {
    setStateSeats(input.target.value)
  }

  const submitStateResults = async () => {
    const errorDiv = document.querySelector<HTMLElement>('.error');
    errorDiv.style.display = 'none';
    try {
      const result: any = [name, votesBiden, votesTrump, stateSeats];
      const tx = await usElectionContract.submitStateResult(result);
      const txHash = tx.hash;
      const loadingElement = document.querySelector<HTMLElement>('.loading');
      loadingElement.style.display = 'block';
      const hashDisplay = document.querySelector<HTMLAnchorElement>('.trxHash');
      hashDisplay.innerHTML = txHash;
      hashDisplay.href = `https://goerli.etherscan.io/tx/${txHash}`;
      await tx.wait();
      loadingElement.style.display = 'none';
      hashDisplay.innerHTML = '';
    } catch (error) {
      console.log(error.message)
      errorDiv.style.display = 'block';
      const errorMsg = document.querySelector<HTMLElement>('.error-message');
      errorMsg.innerHTML = await error.message;
    } finally {
      resetForm();
    }
  }

  const endElection = async () => {
    const tx = await usElectionContract.endElection();
    await tx.wait();
    resetForm();
  }

  const resetForm = async () => {
    setName('');
    setVotesBiden(0);
    setVotesTrump(0);
    setStateSeats(0);
    getCurrentLeader();
    getSeats();
  }

  return (
    <div className="results-form">
      <p>
        Current Leader is: {currentLeader}
      </p>
      <p>
        Seats Biden: {seatsBiden}
      </p>
      <p>
        Seats Trump: {seatsTrump}
      </p>
      <p>
        Election State: {electionState}
      </p>
      <form>
        <label>
          State:
          <input onChange={stateInput} value={name} type="text" name="state" />
        </label>
        <label>
          BIDEN Votes:
          <input onChange={bideVotesInput} value={votesBiden} type="number" name="biden_votes" />
        </label>
        <label>
          TRUMP Votes:
          <input onChange={trumpVotesInput} value={votesTrump} type="number" name="trump_votes" />
        </label>
        <label>
          Seats:
          <input onChange={seatsInput} value={stateSeats} type="number" name="seats" />
        </label>
        {/* <input type="submit" value="Submit" /> */}
      </form>
      <div className="button-wrapper">
        <button onClick={submitStateResults}>Submit Results</button>
        <button onClick={endElection}>End Election</button>
      </div>
      <div className="error">
        <p className="error-message"></p>
      </div>
      <div className="loading">
        <a className="trxHash"></a>
      </div>
      <style jsx>{`
        .results-form {
          display: flex;
          flex-direction: column;
        }

        .button-wrapper {
          margin: 20px;
        }

        .loading {
          display: none;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 100;
          width: 100vw;
          height: 100vh;
          background-color: rgba(192, 192, 192, 0.5);
          background-image: url("https://i.stack.imgur.com/MnyxU.gif");
          background-repeat: no-repeat;
          background-position: center;
        }

        .trxHash {
          animation: blinker 1s linear infinite;
          background-color: rgb(0, 0, 255, 0.5);
        }

        @keyframes blinker {
          50% {
            opacity: 0;
          }
        }

        .error {
          background-color: red;
          display: none;
        }
      `}</style>
    </div>
  );
};

export default USLibrary;
