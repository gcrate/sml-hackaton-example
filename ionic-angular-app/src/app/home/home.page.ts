import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  const SERVICE_URL = "https://mh0igf3cyk.execute-api.us-east-1.amazonaws.com/prod"

	public registrationForm: FormGroup;
	public verificationForm: FormGroup;

	public submitAttempt: boolean = false;

  public state: string = 'registered';

  public hasNext: boolean = true;
  public hasPrevious: boolean = true;

  private uuid: string;
  private secret: string;

  private http: HttpClient;


  constructor(public formBuilder: FormBuilder, public httpClient: HttpClient) {
      this.http = httpClient;

      this.uuid = localStorage.getItem('uuid');
      this.secret = localStorage.getItem('secret');

      if(!this.uuid) {
        this.state = 'registration';
      } else if (!secret) {
        this.state = 'verification';
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

      var headers = new Headers();
      headers.append("Accept", 'application/json');
      headers.append('Content-Type', 'application/json' );
      let options = {
         headers: headers
      }

      this.http.post(this.SERVICE_URL, data, options)
        .subscribe(data => {
          console.log(data['_body']);
         }, error => {
          console.log(error);
        });
    }

    prev(){
        this.signupSlider.slidePrev();
    }

    save(){

    }

}
