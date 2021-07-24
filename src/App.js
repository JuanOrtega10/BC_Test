import './App.css';
import { useForm } from 'react-hook-form';
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn } from 'mdbreact';

function App() {
  const { register, handleSubmit } = useForm()

  const onSubmit = (data) => {
    console.log(data)
  }
  return (
    <section id="login">

    <div class="container">
      <div class="row">
        <div class="col-xs-12">
            <div class="form-wrap">
              <h1>Demo</h1>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div class="form-group">
                  <label htmlFor="email"  class="sr-only">Email</label>
                  <input type="email"  name="email" id="email" class="form-control" placeholder="example@a.com" {...register("email", { required: true, pattern: /^\S+@\S+$/i })} />
                </div>
                <div>
                    <input class="custom-file-input" type="file" {...register("data", { required: true })} />
                </div>
                <br></br>
                  <div id="divButton">
                  <button  type="submit" id="btn-login" class="btn btn-custom btn-lg btn-block">Submit</button>
                  </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    
</section>
    

  );
}

export default App;
