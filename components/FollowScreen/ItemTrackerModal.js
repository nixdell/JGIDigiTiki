import React, { Component } from 'react';
import {
  Text,
  Modal,
  Picker,
  View
} from 'react-native';
import Button from 'react-native-button';
import util from '../util';
import strings from '../../data/strings';
import sharedStyles from '../SharedStyles';

export default class ItemTrackerModal extends Component {

  state = {
    startTime: this.props.startTime,
    endTime: this.props.endTime,
    mainSelection: this.props.mainSelection,
    secondarySelection: this.props.secondarySelection,
    isEditing: this.props.startTime !== null
  };

  componentWillReceiveProps(nextProps) {
    // You don't have to do this check first, but it can help prevent an unneeded render
    // if (nextProps.startTime !== this.state.startTime) {
    //   this.setState({ startTime: nextProps.startTime });
    //
    this.setState({
      startTime: nextProps.initialStartTime,
      endTime: nextProps.initialEndTime,
      mainSelection: nextProps.initialMainSelection,
      secondarySelection: nextProps.initialSecondarySelection,
      isEditing: nextProps.initialStartTime !== null
    });
  }

  render() {

    const mainPickerItems = this.props.mainList.map((e, i) => {
      return (<Picker.Item key={i} label={e[1]} value={e[0]} />);
    });

    const secondaryPickerItems = this.props.secondaryList.map((e, i) => {
      return (<Picker.Item key={i} label={e[1]} value={e[0]} />);
    });

    let timePickerItems = util.getTrackerTimes(util.dbTime2UserTime(this.props.beginFollowTime))
        .map((e, i) => {
          return (<Picker.Item key={i} label={e} value={e} />);
        });
    timePickerItems.unshift((<Picker.Item key={-1} label={strings.TimeFormat} value='ongoing' />));

    return (
        <Modal
            style={styles.modal}
            animationType={"slide"}
            transparent={false}
            visible={this.props.visible}
            onRequestClose={() => {alert("Modal has been closed.")}}
        >
          <View style={{marginTop: 22}}>
            <View style={styles.modalHeader}>
              <Button
                  style={sharedStyles.btn}
                  styleDisabled={{opacity: 0.5}}
                  disabled={
                    [this.state.mainSelection, this.state.secondarySelection, this.state.startTime]
                        .some(x => x === null) || (this.state.endTime !== 'ongoing' && this.state.endTime < this.state.startTime)
                  }
                  onPress={() => {
                    const data = {
                      mainSelection: this.state.mainSelection,
                      secondarySelection: this.state.secondarySelection,
                      startTime: this.state.startTime,
                      endTime: this.state.endTime !== null ? this.state.endTime : 'ongoing'
                    };
                    this.props.onSave(data, this.state.isEditing);
                    this.props.onDismiss();
                  }}>
                {strings.ItemTracker_Save}
              </Button>

              <Text style={[sharedStyles.text.size.title, sharedStyles.text.color.normal]}>
                {this.props.title}
              </Text>

              <Button
                  style={sharedStyles.btn}
                  onPress={() => {
                    this.props.onDismiss();
                  }}>
                {strings.ItemTracker_Cancel}
              </Button>
            </View>

            <View style={styles.timeSelectionGroup}>
              <Picker
                  selectedValue={this.state.startTime}
                  onValueChange={(v)=>{this.setState({startTime: v})}}
                  style={styles.timeSelectionPicker}
              >
                {timePickerItems}
              </Picker>
              <Text style={styles.timeSelectionToText}>{strings.ItemTracker_TimeTo}</Text>
              <Picker
                  selectedValue={this.state.endTime}
                  onValueChange={(v)=>{this.setState({endTime: v})}}
                  style={styles.timeSelectionPicker}
              >
                {timePickerItems}
              </Picker>
            </View>

            <Picker
                selectedValue={this.state.mainSelection}
                onValueChange={(v)=>{this.setState({mainSelection: v})}}>
              {mainPickerItems}
            </Picker>

            <Picker
                selectedValue={this.state.secondarySelection}
                onValueChange={(v)=>{this.setState({secondarySelection: v})}}>
              {secondaryPickerItems}
            </Picker>
          </View>
        </Modal>
    );
  }
}

const styles = {
  modal: {
    flex: 1
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    alignItems: 'center',
    height: 40,
    paddingLeft: 12,
    paddingRight: 12
  },
  headerRow: {
    flex:1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
    alignItems: 'center',
    height: 50,
  },
  timeSelectionGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  timeSelectionToText: {
    fontSize: 16
  },
  timeSelectionPicker: {
    width: 250
  }
};