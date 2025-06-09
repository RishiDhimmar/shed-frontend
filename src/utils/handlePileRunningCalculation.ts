import { toJS } from "mobx";
import foundationStore from "../stores/FoundationStore";

export const handlePileRunningCalculation = () => {
  const piles = foundationStore.groups.flatMap((group) =>
    group.foundations.filter((pile) => pile.type === "Pile Foundation")
  );

  piles.map((pile) => {
    // console.log(toJS(pile.pileDetails.length));
  });
};
