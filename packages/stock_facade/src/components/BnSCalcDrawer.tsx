import React, { useState } from "react";
import log from "loglevel";
import {
  Classes,
  Drawer,
  Position,
  NumericInput,
  FormGroup,
  Intent,
  Icon,
  ControlGroup,
  Button,
  Popover,
  PopoverInteractionKind,
  Colors,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import classNames from "classnames";
import * as CalcUtility from "@/utils/CalcUtility";
import { useStickyState } from "@/Hooks";
import {
  expandNumberAbbreviationTerms,
  nanStringToEmptyString,
  evaluateNumbers,
} from "@/components/Commons";

const calculateNetGainAndNetLoss = (breakEvenPrice: number) => {
  return {
    netGain15: CalcUtility.computePercentageSellPrice(breakEvenPrice, 0.15).toFixed(2),
    netGain10: CalcUtility.computePercentageSellPrice(breakEvenPrice, 0.1).toFixed(2),
    netGain8: CalcUtility.computePercentageSellPrice(breakEvenPrice, 0.08).toFixed(2),
    netGain5: CalcUtility.computePercentageSellPrice(breakEvenPrice, 0.05).toFixed(2),
    netGain3: CalcUtility.computePercentageSellPrice(breakEvenPrice, 0.03).toFixed(2),
    netLoss3: CalcUtility.computePercentageSellPrice(breakEvenPrice, -0.03).toFixed(2),
    netLoss5: CalcUtility.computePercentageSellPrice(breakEvenPrice, -0.05).toFixed(2),
    netLoss8: CalcUtility.computePercentageSellPrice(breakEvenPrice, -0.08).toFixed(2),
    netLoss10: CalcUtility.computePercentageSellPrice(breakEvenPrice, -0.1).toFixed(2),
    netLoss15: CalcUtility.computePercentageSellPrice(breakEvenPrice, -0.15).toFixed(2),
  };
};

const SplitContainer = styled.div`
  display: flex;
`;

const BuyContainer = styled.div`
  flex: 1;
  margin-right: 5px;
`;

const SellContainer = styled.div`
  flex: 1;
  margin-left: 5px;
`;

const RightTextAlignContanier = styled.div`
  text-align: right;
`;

const AdjustedButton = styled(Button)`
  margin-left: 10px;
`;

type CustomLiProps = {
  inputColor: string;
};

const CustomLi = styled.li<CustomLiProps & React.HTMLProps<HTMLElement>>`
  color: white;
  padding: 3px !important;
  background-color: ${(props) => props.inputColor || "white"};
`;

type DrawerProps = {
  isOpen: boolean;
  closeCb: () => void;
};

type FormInputs = {
  commissionRate: number;
  shares: number;
  buyPrice: number;
  sellPrice: number;
};

export const BnSCalcDrawer = ({ isOpen, closeCb }: DrawerProps): JSX.Element => {
  const [formValues, setFormValues] = useStickyState(
    {
      commissionRate: "0.0025",
      shares: "",
      buyPrice: "",
      sellPrice: "",
    },
    "bnsCalc",
  );
  const [computedValues, setComputedValues] = useState({
    buyGrossAmount: "",
    buyFees: "",
    buyNetAmount: "",
    sellGrossAmount: "",
    sellFees: "",
    sellNetAmount: "",
    breakEvenPrice: "",
    netProfit: "",
    netGain15: "",
    netGain10: "",
    netGain8: "",
    netGain5: "",
    netGain3: "",
    netLoss3: "",
    netLoss5: "",
    netLoss8: "",
    netLoss10: "",
    netLoss15: "",
  });
  const { register, handleSubmit, errors } = useForm<FormInputs>();

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    handleConfirm(e.target.name, e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const targetElement = e.target as HTMLInputElement;
      handleConfirm(targetElement.name, targetElement.value);
    }
  };

  const handleConfirm = (name: string, value: string) => {
    let result = value;

    result = expandNumberAbbreviationTerms(result);
    result = evaluateNumbers(result);
    result = nanStringToEmptyString(result);

    setFormValues({ ...formValues, [name]: result });
  };

  const handleValueChange = (
    _valueAsNumber: number,
    valueAsString: string,
    inputElement: HTMLInputElement,
  ) => {
    setFormValues({ ...formValues, [inputElement.name]: valueAsString });
  };

  const onSubmit = (data: FormInputs) => {
    const buyGrossAmount = data.buyPrice * data.shares;
    const buyFees = CalcUtility.computeBuyFees(
      data.buyPrice,
      data.shares,
      data.commissionRate,
    );
    const buyNetAmount = buyGrossAmount + buyFees;
    const sellGrossAmount = data.sellPrice * data.shares;
    const sellFees = CalcUtility.computeSellFees(
      data.sellPrice,
      data.shares,
      data.commissionRate,
    );
    const sellNetAmount = sellGrossAmount - sellFees;
    const priceDecimalPlaces = CalcUtility.getPriceDecimalPlace(data.buyPrice.toString());
    const breakEvenPrice = CalcUtility.computeBreakEvenSellPrice(
      data.shares,
      buyNetAmount,
      priceDecimalPlaces,
      data.commissionRate,
    );
    const netProfit = sellNetAmount - buyNetAmount;
    const netProfitPercentage = CalcUtility.computeChangePercentage(
      sellNetAmount,
      buyNetAmount,
    );
    const netProfitWithPercentage = `${Intl.NumberFormat().format(
      netProfit,
    )} (${netProfitPercentage.toFixed(2)}%)`;

    const netGainAndNetLoss = calculateNetGainAndNetLoss(breakEvenPrice);

    setComputedValues({
      buyGrossAmount: Intl.NumberFormat().format(buyGrossAmount),
      buyFees: Intl.NumberFormat().format(buyFees),
      buyNetAmount: Intl.NumberFormat().format(buyNetAmount),
      sellGrossAmount: Intl.NumberFormat().format(sellGrossAmount),
      sellFees: Intl.NumberFormat().format(sellFees),
      sellNetAmount: Intl.NumberFormat().format(sellNetAmount),
      breakEvenPrice: Intl.NumberFormat().format(breakEvenPrice),
      netProfit: netProfitWithPercentage,
      ...netGainAndNetLoss,
    });

    log.trace(
      buyGrossAmount,
      buyFees,
      buyNetAmount,
      sellGrossAmount,
      sellFees,
      sellNetAmount,
      breakEvenPrice,
      netProfitWithPercentage,
    );
  };

  return (
    <>
      <Drawer
        autoFocus={true}
        canEscapeKeyClose={false}
        canOutsideClickClose={true}
        enforceFocus={true}
        hasBackdrop={true}
        position={Position.RIGHT}
        usePortal={true}
        size={Drawer.SIZE_STANDARD}
        isOpen={isOpen}
        icon={IconNames.CALCULATOR}
        onClose={closeCb}
        title="Buy &amp; Sell Calculator (Common Stocks)"
      >
        <div className={Classes.DRAWER_BODY}>
          <div className={Classes.DIALOG_BODY}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormGroup
                label="Commission Rate"
                labelFor="input-commission-rate"
                labelInfo="(required)"
              >
                <NumericInput
                  id="input-commission-rate"
                  fill={true}
                  allowNumericCharactersOnly={true}
                  onValueChange={handleValueChange}
                  buttonPosition="none"
                  placeholder="Enter the commission rate otherwise will default to 0.0025 or 0.25%."
                  minorStepSize={0.00001}
                  value={formValues.commissionRate}
                  name="commissionRate"
                  inputRef={register({ required: true })}
                />
              </FormGroup>
              <FormGroup label="Shares" labelFor="input-shares" labelInfo="(required)">
                <NumericInput
                  id="input-shares"
                  fill={true}
                  allowNumericCharactersOnly={false}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  onValueChange={handleValueChange}
                  buttonPosition="none"
                  placeholder="Enter the number of shares..."
                  minorStepSize={0.00001}
                  value={formValues.shares}
                  name="shares"
                  inputRef={register({ required: true })}
                />
              </FormGroup>
              <SplitContainer>
                <BuyContainer>
                  <FormGroup
                    label="Buy Price"
                    labelFor="input-buy-price"
                    labelInfo="(required)"
                  >
                    <NumericInput
                      id="input-buy-price"
                      fill={true}
                      allowNumericCharactersOnly={true}
                      onValueChange={handleValueChange}
                      buttonPosition="none"
                      placeholder="Enter the buy price..."
                      minorStepSize={0.00001}
                      leftIcon={IconNames.DOLLAR}
                      value={formValues.buyPrice}
                      name="buyPrice"
                      inputRef={register({ required: true })}
                    />
                  </FormGroup>
                  <FormGroup
                    label="Total Fees"
                    helperText="The fee used when buying a common stock."
                  >
                    <ControlGroup fill={true}>
                      <div className={classNames(Classes.INPUT_GROUP)}>
                        <Icon icon={IconNames.DOLLAR} />
                        <RightTextAlignContanier
                          className={classNames(Classes.INPUT, Classes.DISABLED)}
                        >
                          {computedValues.buyFees}
                        </RightTextAlignContanier>
                      </div>
                    </ControlGroup>
                  </FormGroup>
                  <FormGroup
                    label="Total Net Amount"
                    helperText="The amount to be spent."
                  >
                    <ControlGroup fill={true}>
                      <div className={classNames(Classes.INPUT_GROUP)}>
                        <Icon icon={IconNames.DOLLAR} />
                        <RightTextAlignContanier
                          className={classNames(Classes.INPUT, Classes.DISABLED)}
                        >
                          {computedValues.buyNetAmount}
                        </RightTextAlignContanier>
                      </div>
                    </ControlGroup>
                  </FormGroup>
                </BuyContainer>
                <SellContainer>
                  <FormGroup
                    label="Sell Price"
                    labelFor="input-sell-price"
                    labelInfo="(required)"
                  >
                    <NumericInput
                      id="input-sell-price"
                      fill={true}
                      allowNumericCharactersOnly={false}
                      onValueChange={handleValueChange}
                      buttonPosition="none"
                      placeholder="Enter the sell price..."
                      minorStepSize={0.00001}
                      leftIcon={IconNames.DOLLAR}
                      value={formValues.sellPrice}
                      name="sellPrice"
                      inputRef={register({ required: true })}
                    />
                  </FormGroup>
                  <FormGroup
                    label="Total Fees"
                    helperText="The fee used when selling a common stock."
                  >
                    <ControlGroup fill={true}>
                      <div className={classNames(Classes.INPUT_GROUP)}>
                        <Icon icon={IconNames.DOLLAR} />
                        <RightTextAlignContanier
                          className={classNames(Classes.INPUT, Classes.DISABLED)}
                        >
                          {computedValues.sellFees}
                        </RightTextAlignContanier>
                      </div>
                    </ControlGroup>
                  </FormGroup>
                  <FormGroup
                    label="Total Net Amount"
                    helperText="The amount to be earned."
                  >
                    <ControlGroup fill={true}>
                      <div className={classNames(Classes.INPUT_GROUP)}>
                        <Icon icon={IconNames.DOLLAR} />
                        <RightTextAlignContanier
                          className={classNames(Classes.INPUT, Classes.DISABLED)}
                        >
                          {computedValues.sellNetAmount}
                        </RightTextAlignContanier>
                      </div>
                    </ControlGroup>
                  </FormGroup>
                </SellContainer>
              </SplitContainer>
              <FormGroup
                label="Break-Even Price"
                helperText="The price to get a break even."
              >
                <ControlGroup fill={true}>
                  <div className={classNames(Classes.INPUT_GROUP)}>
                    <Icon icon={IconNames.DOLLAR} />
                    <RightTextAlignContanier
                      className={classNames(Classes.INPUT, Classes.DISABLED)}
                    >
                      {computedValues.breakEvenPrice}
                    </RightTextAlignContanier>
                  </div>
                </ControlGroup>
              </FormGroup>
              <FormGroup
                label="Net Profit"
                helperText="The amount yield from transaction."
              >
                <ControlGroup fill={true}>
                  <div className={classNames(Classes.INPUT_GROUP)}>
                    <Icon icon={IconNames.DOLLAR} />
                    <RightTextAlignContanier
                      className={classNames(Classes.INPUT, Classes.DISABLED)}
                    >
                      {computedValues.netProfit}
                    </RightTextAlignContanier>
                  </div>
                </ControlGroup>
              </FormGroup>
              <Button type="submit">Calculate</Button>
              <Popover
                interactionKind={PopoverInteractionKind.CLICK}
                popoverClassName={Classes.POPOVER_CONTENT_SIZING}
                position={Position.RIGHT_BOTTOM}
                usePortal={true}
              >
                <AdjustedButton
                  type="button"
                  intent={Intent.PRIMARY}
                  disabled={computedValues.breakEvenPrice !== "" ? false : true}
                >
                  View Sell At Range
                </AdjustedButton>
                <section>
                  <ol className={classNames(Classes.LIST_UNSTYLED)}>
                    <CustomLi inputColor={Colors.GREEN1}>
                      Net Gain 15 = {computedValues.netGain15}
                    </CustomLi>
                    <CustomLi inputColor={Colors.GREEN2}>
                      Net Gain 10 = {computedValues.netGain10}
                    </CustomLi>
                    <CustomLi inputColor={Colors.GREEN3}>
                      Net Gain 08 = {computedValues.netGain8}
                    </CustomLi>
                    <CustomLi inputColor={Colors.GREEN4}>
                      Net Gain 05 = {computedValues.netGain5}
                    </CustomLi>
                    <CustomLi inputColor={Colors.GREEN5}>
                      Net Gain 03 = {computedValues.netGain3}
                    </CustomLi>
                    <CustomLi inputColor={Colors.RED5}>
                      Net Loss 03 = {computedValues.netLoss3}
                    </CustomLi>
                    <CustomLi inputColor={Colors.RED4}>
                      Net Loss 05 = {computedValues.netLoss5}
                    </CustomLi>
                    <CustomLi inputColor={Colors.RED3}>
                      Net Loss 08 = {computedValues.netLoss8}
                    </CustomLi>
                    <CustomLi inputColor={Colors.RED2}>
                      Net Loss 10 = {computedValues.netLoss10}
                    </CustomLi>
                    <CustomLi inputColor={Colors.RED1}>
                      Net Loss 15 = {computedValues.netLoss15}
                    </CustomLi>
                  </ol>
                </section>
              </Popover>
            </form>
          </div>
        </div>
        <div className={Classes.DRAWER_FOOTER}>Stock Oracle</div>
      </Drawer>
    </>
  );
};
