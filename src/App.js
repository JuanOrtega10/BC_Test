import './App.css';
import { useForm } from 'react-hook-form';
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn } from 'mdbreact';

function App() {
  const { register, handleSubmit } = useForm()

  const onSubmit = (data) => {
    console.log(data)
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
          <label htmlFor="email">Email</label>
          <input type="email" placeholder="example@a.com" {...register("email", { required: true, pattern: /^\S+@\S+$/i })} />
      </div>
      <div>
          <label htmlFor="data">File</label>
          <input type="file" {...register("data", { required: true })} />
      </div>
      <button>Submit</button>
    </form>

  );
}

export default App;
