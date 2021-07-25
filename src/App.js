import './App.css';
import { useForm } from 'react-hook-form';
const parse = require('csv-parse/lib/sync')
const reader  = new FileReader();

const validate = async (data) => {
  return new Promise(function(resolve, reject) {
    reader.readAsText(data[0])
    reader.onload = function (e) {
      let isValid = true
      const text = e.target.result;
      try{
        const records = parse(text, {
          columns: true,
          skip_empty_lines: true
        })
        console.log(records)
      }
      catch {
        isValid = false
      }
      resolve(isValid)
    }
  });
}

const isCsv = async (data) => {
  const isValid = await validate(data)
  console.log(isValid) 
  return isValid
}

 
function App() {
  const { register, formState: { errors }, handleSubmit } = useForm()

  const onSubmit = (response) => {
    /* let data = response.data
    let email = response.email
    let path = URL.createObjectURL(data[0]) */
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
                    <input class="custom-file-input" type="file" {...register("data", { required: true , validate: isCsv})} />
                </div>
                {
                  errors.data && errors.data.type === "validate" && (
                    <div className="error">The file must be in the CSV scheme</div>
                  )
                }
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
