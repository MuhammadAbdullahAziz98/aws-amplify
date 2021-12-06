import { Component } from 'react';
import { withAuthenticator } from 'aws-amplify-react'
import '@aws-amplify/ui/dist/style.css';
import {API , graphqlOperation} from 'aws-amplify';
import {createNote, deleteNote, updateNote} from './graphql/mutations';
import {listNotes} from './graphql/queries';

class App extends Component {
  state={
    id:"",
    note: "",
    notes:[]
  }

  handleChangeNote = event => this.setState({note: event.target.value});

  isExistingNote = () =>{
    const {notes, id} = this.state;
    if (id) {
      const isNote = notes.findIndex(note => note.id === id) > -1;
      return isNote;
    } 
    return false;
  }

  createNote = async event => {
    event.preventDefault();
    const { note, notes } = this.state;
    if(this.isExistingNote)
    {
      console.log("Update Note");
      this.handleUpdateNote();
    }
    else{
      const input = { note }
      const result = await API.graphql(graphqlOperation(createNote, {input}));
      const newNote = result.data.createNote;
      const updatedNotes = [newNote, ...notes];
      this.setState({notes: updatedNotes,note:""});
    }
  }

  handleUpdateNote = async() => {
    const { id, note, notes} = this.state;
    const input = {id, note}
    const result = await API.graphql(graphqlOperation(updateNote, {input}));
    const updatedNote = result.data.updateNote;
    const ind =notes.findIndex( note=> note.id === updatedNote.id);
    const updatedNotes = [
      ...notes.slice(0,ind),
      updatedNote,
      ...notes.slice(ind+1)
    ]
    this.setState({notes:updatedNotes, id:"", note:""})
  }

  async componentDidMount(){
     const results = await API.graphql(graphqlOperation(listNotes));
     this.setState({notes:results.data.listNotes.items});
  }

  deleteNote = async id => {
    const {notes} = this.state;
    const input = {id}
    const result = await API.graphql(graphqlOperation(deleteNote, {input}));
    const deletedNodeId = result.data.deleteNote.id;
    const updatedNotes = notes.filter(note => note.id !== deletedNodeId);
    this.setState({notes: updatedNotes});
  }

  editNote = ({note, id}) => {
    this.setState({note, id}); 
  }

  render(){
    const {id, notes, note} = this.state;
    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
        <h1 className="code f2-l">Amplify Notetaker</h1> 
        {/**
         * Note Form
         */}
        <form className="mb3" onSubmit={this.createNote}>
          <input type="text" className="pa2 f4" placeholder="Write your text" 
          onChange={this.handleChangeNote} value={note}/>
          <button className="pa2 f4" type="submit"> 
          { !id ? "Add " : "Update "}         
            Note
          </button>
        </form>
        {/**
         * Notes List
         */}
         <div>
           {notes.map(item=>(
            <div key={item.id} className="flex items-center">
              <li className="list pa1 f3" onClick={() => this.editNote(item)}>
                {item.note}
              </li>
              <button onClick={() => this.deleteNote(item.id)} className="bg-transparent bn f4">
                <span>
                  &times;
                </span>
              </button>
            </div>
           ))}
         </div>
      </div>
    );
  }
}

export default withAuthenticator(App, { includeGreetings : true });
