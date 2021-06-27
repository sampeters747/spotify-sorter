import React from "react";
import { LinearProgress, Tooltip } from "@material-ui/core";
import scale from "../utils/scale";

export default class Valuebar extends React.Component {
    render() {
        let scaledValue;
        if (this.props.maxValue) {
            scaledValue = scale(this.props.value, this.props.maxValue);
        } else {
            scaledValue = scale(this.props.value, 1);
        }

        let titleText;
        if (this.props.usePercents) {
            titleText = scaledValue + "% " + this.props.title;
        } else {
            titleText = this.props.value + " " + this.props.title;
        }
        return (
            <Tooltip title={titleText}>
                <LinearProgress value={scaledValue} variant="determinate" />
            </Tooltip>
        )
    }
}