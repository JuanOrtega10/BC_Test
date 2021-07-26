import './App.css';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import axios from 'axios';

const reader  = new FileReader();
const parse = require('csv-parse/lib/sync')


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
        console.log(records[0]&&records[0].nombre&&records[0].cedula)
        isValid = records[0] !== undefined && records[0].nombre !== undefined && records[0].cedula !== undefined
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
  return isValid
}

 
function App() {
  const [logger, setLogger] = useState([]);
  const { register, formState: { errors }, handleSubmit } = useForm()

  const onSubmit = async (response) => {

    let date = new Date()
    console.log(response.data[0].name, response.data[0].type, response.data[0])
    let file = response.data[0]
    const contentType = file.type
    const generatePutUrl = 'https://9edaxfeptc.execute-api.us-east-1.amazonaws.com/getPresignedUrl'
    const options = {
      params: {
        key: `${date.getTime()}-${file.name}`,
        ContentType: contentType
      },
      headers: {
        'Content-Type': contentType
      }
    };
    setLogger([...logger, ["Uploading File to S3...",""]]);
    axios.get(generatePutUrl, options).then(res => {
        const {
          data: { uploadURL }
        } = res;
        console.log(res)
        axios
          .put(uploadURL, file)
          .then(res => {
            console.log(res)
            setLogger([...logger, ["Upload Succesful",""]]);
            let postURL = "https://9edaxfeptc.execute-api.us-east-1.amazonaws.com/processCsv"
            const optionsPost = {
              params: {
                id: `${date.getTime()}`,
                key: `${date.getTime()}-${file.name}`,
                email: response.email 
              }
            };
            console.log(optionsPost)
            axios
              .post(postURL,null,optionsPost)
              .then(res => {
                console.log(res.data)
                if (res.data.response && res.data.response === true ){
                  setLogger([...logger, ["The file was sent to the email entered. You can also download the transformed csv from ", res.data.path]]);
                  console.log(logger)
                }
                else if(res.data.response && res.data.response !== true){
                  setLogger([...logger, "Error: " + res.data.response]);
                }
              })
          })
          .catch(err => {
            setLogger([...logger, ["Sorry, something went wrong", ""]]);
            console.log('err', err);
          });
      });
    
    }

    ;
    
    
    /* let data = response.data
    let email = response.email
    let path = URL.createObjectURL(data[0]) */
  
  return (
    <section id="login">

    <div className="container">
      <div className="row">
        <div className="col-xs-12">
            <div className="form-wrap">
              <h1>Demo</h1>
              <form onSubmit={handleSubmit(onSubmit)} >
                <div className="form-group">
                  <label htmlFor="email"  className="sr-only">Email</label>
                  <input type="email"  name="email" id="email" className="form-control" placeholder="example@a.com" {...register("email", { required: true, pattern: /^\S+@\S+$/i })} />
                </div>
                <div>
                    <input className="custom-file-input" type="file" {...register("data", { required: true , validate: isCsv})} />
                </div>
                {
                  errors.data && errors.data.type === "validate" && (
                    <div className="error">The file must be in the CSV scheme</div>
                  )
                }
                <br></br>
                  <div id="divButton">
                  <button  type="submit" id="btn-login" className="btn btn-custom btn-lg btn-block">Submit</button>
                  </div>
              </form>
              <section id="logs">{logger.map((log, index) => <p key={index}>{log[0]}
              {
                log[1] !== "" && <a href={log[1]}> here </a>
              }
              </p>)}
              </section>
            </div>
          </div>
        </div>
      </div>
    
</section>
    

  );
}

export default App;
