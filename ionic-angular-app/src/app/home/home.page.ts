import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  private SERVICE_URL = "https://mh0igf3cyk.execute-api.us-east-1.amazonaws.com/prod"
  private ENABLE_ADD_AFTER_HOUR: number = 20;
  private serviceHourStr: string;

	public registrationForm: FormGroup;
	public verificationForm: FormGroup;

	public submitAttempt: boolean = false;

  public state: string = 'registered';

  public hasNext: boolean = true;
  public hasPrevious: boolean = true;

  private uuid: string;
  private secret: string;

  private http: HttpClient;

  public loading: boolean = false;
  public friend: string;
  public goal: string = "goal here";
  public count: string = "0";
  public reported: string;

  public allowAdd: boolean = true;
  public allowReset: boolean = true;
  public showTooEarly: boolean = true;

  constructor(public formBuilder: FormBuilder, public httpClient: HttpClient) {
      this.http = httpClient;

      //Parse the serviceHourStr from ENABLE_ADD_AFTER_HOUR
      if(this.ENABLE_ADD_AFTER_HOUR > 12) {
        this.serviceHourStr = (this.ENABLE_ADD_AFTER_HOUR - 12) + 'pm';
      } else if (this.ENABLE_ADD_AFTER_HOUR == 0){
        this.serviceHourStr = '12am';
      } else {
        this.serviceHourStr = this.ENABLE_ADD_AFTER_HOUR + 'am'
      }


      this.uuid = localStorage.getItem('uuid');
      this.secret = localStorage.getItem('secret');

      if(!this.uuid) {
        this.state = 'registration';
      } else if (!this.secret) {
        this.state = 'verification';
      } else {
        this.refreshState();
      }
      console.log(this.state)

      this.registrationForm = formBuilder.group({
          name: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
          phone: ['', Validators.compose([Validators.pattern('[0-9]{11}'), Validators.required])],
          goal: ['', Validators.compose([Validators.required])]
      });

      this.verificationForm = formBuilder.group({
          pin: ['', Validators.compose([Validators.required, Validators.pattern('[0-9]*')])],
      });
  }



    register(){
      this.submitAttempt = true;
      if (this.registrationForm.invalid) {
          return;
      }

      let data = {
        name: this.registrationForm.controls.name.value,
        goal: this.registrationForm.controls.goal.value,
        phone: this.registrationForm.controls.phone.value
      }

      //let headers = new Headers();
      //headers.append("Accept", 'application/json');
      //headers.append('Content-Type', 'application/json' );
      let options = {
         headers: {
           'Accept': 'application/json'
         }
      }

      this.loading = true;
      this.http.post(this.SERVICE_URL + '/register', data, options)
        .subscribe(data => {
          console.log(data['uuid']);
          this.loading = false;
          localStorage.setItem('uuid', data['uuid']);
          this.uuid = data['uuid'];
          this.state = 'verification';
          this.submitAttempt = false;
         }, error => {
          alert(error); //We should probably actually do something with this
          this.loading = false;
        });
    }

    verify(){
      this.submitAttempt = true;
      if (this.verificationForm.invalid) {
          return;
      }

      let data = {
        uuid: this.uuid,
        pin: this.verificationForm.controls.pin.value,
      }

      this.loading = true;
      this.http.post(this.SERVICE_URL + '/verify', data)
        .subscribe(data => {
          this.loading = false;
          localStorage.setItem('secret', data['secret']);
          this.secret = data['secret'];
          this.state = 'registered';
          this.submitAttempt = false;
         }, error => {
          alert("Invalid Pin (or service issue)"); //We should probably actually do something with this
          this.loading = false;
        });
    }

    setFriend(){
      let validFriend = false;
      while(!validFriend) {
        this.friend=prompt("Enter 11-digit phone number for friend", this.friend)
        if(!this.friend || this.friend.match(/[0-9]{11}/g)) {
          validFriend = true;
        } else {
          alert('Invalid phone #');
        }
      }

      let data = {
        uuid: this.uuid,
        secret: this.secret,
        friend: this.friend
      }

      this.loading = true;
      this.http.post(this.SERVICE_URL + '/set-friend', data)
        .subscribe(data => {
          this.loading = false;
         }, error => {
          alert(error); //We should probably actually do something with this
          this.loading = false;
        });
    }

    resetCount() {
      if(this.allowReset) {
        let data = {
          uuid: this.uuid,
          secret: this.secret,
          action: 'reset'
        }

        this.loading = true;
        this.http.post(this.SERVICE_URL + '/log-action', data)
          .subscribe(data => {
            this.loading = false;
            this.reported = 'today';
            this.count = '0';
            this.allowReset = false;
            this.allowAdd = false;
           }, error => {
            alert(error); //We should probably actually do something with this
            this.loading = false;
          });
      }
    }

    addCount() {
      if(this.allowAdd) {
        let data = {
          uuid: this.uuid,
          secret: this.secret,
          action: 'success'
        }

        this.loading = true;
        this.http.post(this.SERVICE_URL + '/log-action', data)
          .subscribe(data => {
            this.loading = false;
            this.count = data['count'];
            this.reported = 'today';
            this.allowAdd = false;
           }, error => {
            alert(error); //We should probably actually do something with this
            this.loading = false;
          });
      }
    }

    refreshState() {
      let data = {
        uuid: this.uuid,
        secret: this.secret,
      }

      this.loading = true;
      this.http.post(this.SERVICE_URL + '/get-count', data)
        .subscribe(data => {
          this.loading = false;
          this.friend = data['friend'];
          this.goal = data['goal'];
          this.count = data['count'];
          this.showTooEarly = new Date().getHours() < this.ENABLE_ADD_AFTER_HOUR;
          this.allowAdd = data['allowReport'] && !this.showTooEarly;
          this.allowReset = parseInt(this.count) > 0
          this.reported = data['reported']
         }, error => {
          alert(error); //We should probably actually do something with this
          this.loading = false;
        });

    }

}
