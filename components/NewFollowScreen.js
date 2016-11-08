import React, { Component } from 'react';
import {
  Alert,
  AppRegistry,
  BackAndroid,
  DatePickerAndroid,
  Picker,
  StyleSheet,
  TouchableHighlight,
  Text,
  TextInput,
  Navigator,
  View
} from 'react-native';
import Button from 'react-native-button';
import Realm from 'realm';
import Follow from '../models/Follow';

export default class NewFollowScreen extends Component {

  state = {
    beginTime: null,
    chimpPickerItems: [],
    community: null,
    focalChimpId: null,
    hasSetDate: false,
    date: new Date(),
    researcher: ''
  };

  getCommunities = () => {
    return Array.from(new Set(this.props.chimps.map((c, i) => {
      return c.community;
    })));
  }

  getAllTimesForUser = () => {
    return this.props.times.map((val, i) => {
      // We expect something like 01-12:00J, so find the first - and take
      // everything after that.
      const dashIndex = val.indexOf('-');
      return {
        dbTime: val,
        userTime: val.substring(dashIndex + 1)
      };
    });
  };

  showDatePicker = async (stateKey, options) => {
    try {
      var newState = {};
      const {action, year, month, day} = await DatePickerAndroid.open(options);
      if (action === DatePickerAndroid.dismissedAction) {
        // newState[stateKey + 'Text'] = 'dismissed';
      } else {
        var date = new Date(year, month, day);
        // newState[stateKey + 'Text'] = date.toLocaleDateString();
        newState['date'] = date;
        newState['hasSetDate'] = true;
      }
      this.setState(newState);
    } catch ({code, message}) {
      console.warn(`Error in example '${stateKey}': `, message);
    }
  };

  getCommunityPickerItems = () => {
    const communities = this.getCommunities();
    const communityPromptPickerItem = (
        <Picker.Item key="community-prompt" label="Kundi" value={null} />
    );
    const communityPickerItems = communities.map((c, i) => {
      return (<Picker.Item key={c} label={c} value={c} />);
    });
    return [communityPromptPickerItem].concat(communityPickerItems);
  };

  getBeginTimePickerItems = () => {
    const beginTimePromptPickerItem = (
        <Picker.Item key="begin-time-prompt" label="Muda wa kuanza (s:dk)" value={null} />
    );
    const beginTimePickerItems = this.getAllTimesForUser().map((t, i) => {
      return (<Picker.Item key={t.dbTime} label={t.userTime} value={t.dbTime} />);
    });
    return [beginTimePromptPickerItem].concat(beginTimePickerItems);
  }

  getChimpPickerItems = (community) => {

    if (community === null) {
      return [];
    }

    const defaultPickerItem = (<Picker.Item key='Target' label='Target' value={null} />);

    const chimpPickerItems = this.props.chimps
      .filter((c) => c.community === community)
      .map((c, i) => {
        return (<Picker.Item key={c.name} label={c.name} value={c.name} />);
      });
    return [defaultPickerItem].concat(chimpPickerItems);
  }

  getDateString = (date) => {
    if (!this.state.hasSetDate) {
      return "Tarehe ya ufuataji"
    }
    const year = this.state.date.getYear() + 1900;
    const month = this.state.date.getMonth() + 1;
    const day = this.state.date.getDate();
    return month + '/' + day + '/' + year;
  }

  render() {
    const communityPickerItems = this.getCommunityPickerItems();
    const beginTimePickerItems = this.getBeginTimePickerItems();

    BackAndroid.addEventListener('hardwareBackPress', () => {
      if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
        this.props.navigator.pop();
        return true;
      }
      return false;
    });

    return(
      <View style={styles.container}>
        <Text style={styles.description}>Fuata</Text>

        <TouchableHighlight
            style={styles.inputField}
            onPress={this.showDatePicker.bind(this, '', {date: this.state.date})}>
          <Text style={styles.datePickerText}>
            {this.getDateString(this.state.date)}
          </Text>
        </TouchableHighlight>

        <Picker
            style={styles.inputField}
            selectedValue={this.state.community}
            onValueChange={(c) => this.setState({community: c, chimpPickerItems: this.getChimpPickerItems(c)})}>
          {communityPickerItems}
        </Picker>

        <Picker
            style={styles.inputField}
            enabled={this.state.community !== null }
            selectedValue={this.state.focalChimpId}
            onValueChange={(c) => this.setState({focalChimpId: c})}>
          {this.state.chimpPickerItems}
        </Picker>

        <Picker
            style={styles.inputField}
            selectedValue={this.state.beginTime}
            onValueChange={(t) => this.setState({beginTime: t})}>
          {beginTimePickerItems}
        </Picker>
        
        <TextInput
            style={[styles.inputField, styles.researcherNameTextInput]}
            onChangeText={(text) => this.setState({researcher: text})}
            value={this.state.researcher}
            placeholder="Jina la mtafiti"
        />

        <Button
            style={[styles.btn, styles.btnPositive]}
            onPress={() => {
              const hasSetDate = this.state.hasSetDate;
              const hasSetBeginTime = this.state.beginTime !== null;
              const hasSetCommunity = this.state.community != null;
              const hasSetFocalChimpId = this.state.focalChimpId != null;
              const hasSetResearcher = this.state.researcher != null

              if ([hasSetDate, hasSetBeginTime, hasSetCommunity, hasSetFocalChimpId, hasSetResearcher].some(e => !e)) {
                Alert.alert(
                  'Invalid Input',
                  'My Alert Msg',
                  [
                    {text: 'OK', onPress: () => console.log('OK Pressed')},
                  ]
                );
              } else {
                const realm = new Realm({schema: [Follow]});
                const year = this.state.date.getYear() + 1900;
                const month = this.state.date.getMonth() + 1;
                const day = this.state.date.getDate();
                realm.write(() => {
                  const newFollow = realm.create(Follow.className, {
                     FOL_date: this.state.date,
                     FOL_B_AnimID: this.state.focalChimpId,
                     FOL_CL_community_id: this.state.community,
                     FOL_time_begin: this.state.beginTime,
                     FOL_am_observer1: this.state.researcher,
                     FOL_day: day,
                     FOL_month: month,
                     FOL_year: year
                  });
                });

                const follow = realm.objects('Follow').slice(-1).pop();

                this.props.navigator.push({
                  id: 'FollowScreen',
                  follow: follow
                });
              }
            }}
        >
          Anza
        </Button>

      </View>
    );
  }
}


var styles = {
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor:'white',
    alignItems: 'center'
  },
  description: {
    alignSelf: "stretch",
    marginTop: 30,
    marginBottom: 50,
    fontSize: 44,
    textAlign: 'center',
    lineHeight: 40,
    color: 'black'
  },
  btn: {
    width: 500,
    marginTop: 20,
    marginBottom: 20,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 15,
    paddingRight: 15,
    fontSize: 14,
    color: '#fff'
  },
  btnPositive: {
    backgroundColor: '#9c0'
  },
  inputField: {
    width: 500,
  },
  datePickerText: {
    fontSize: 16,
    paddingLeft: 6,
    paddingBottom: 10,
    borderBottomWidth: 1
  },
  researcherNameTextInput: {
    paddingLeft: 6,
    fontSize: 16
  }
};