import * as React from "react"
import { gql, useMutation, useQuery } from "@apollo/client"
import "./style.css";
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import shortid from "shortid";
import { navigate } from "@reach/router"
const APOLLO_Query = gql`
{
  listBookmark {
    id,
    title,
    url,
    desc
  }
}
`
const ALL_BOOKMARKS = gql`
mutation addNewBookmark ($id: ID! $title: String! $desc: String! $url: String!) {
  createBookmark (id: $id title: $title desc: $desc url: $url)
}
`
const DELETE_BOOKMARKS = gql `
mutation deletebookmark ($id: ID!) {
  deleteBookmark (id: $id)
}
`
////////////////////////////////////////////////
const IndexPage = () => {
  const { loading, data, error } = useQuery(APOLLO_Query);
  const [createBookmark] = useMutation(ALL_BOOKMARKS);
  const [deleteBookmark] = useMutation(DELETE_BOOKMARKS)
  const [name, setName] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [desc, setDesc] = React.useState("");

  const handleSubmit = () => {
    createBookmark({
      variables: {
        url: url,
        title: name,
        desc: desc,
        id: shortid.generate()
      },
      refetchQueries: [{ query: APOLLO_Query }],
    })
    setName("");
    setUrl("");
    setDesc("");
  };
const handleDelete = (id: string) => {
   deleteBookmark({
     variables: {
       id,
     },
     refetchQueries: [{query: APOLLO_Query}]
   })
}
  if (error) {
    return <h1>{error.message}</h1>
  }

  if (loading) {
    return <h1>
      The data is being loaded
  </h1>
  }
  console.log(data)
  return (

    <div className="Container">
      <h1 className="heading">BookMark Application</h1>
      <TextField
        color="primary"
        type="text"
        onChange={(e) => setName(e.target.value)}
        id="standard-basic" label="BookMark Name" />
      <br />
      <TextField
        color="primary"
        onChange={(e) => setUrl(e.target.value)}
        type="text" id="standard-basic" label="URL Link" />
      <br />
      <TextField
        color="primary"
        onChange={(e) => setDesc(e.target.value)}
        type="text" id="standard-basic" label="desc" />
      <br />
      <button
        onClick={handleSubmit}
        className="button">Add Bookmark</button>
      <br />
      {data.listBookmark.map((details: any, id: React.Key) =>
        <Card
          key={details.id}
          style={{
            backgroundColor: "white"
          }}
          className="card" >
          <CardActionArea>
            <CardContent className="content" >
              <Typography gutterBottom variant="h5" component="h2">
                {details.title}
              </Typography>
              <Typography gutterBottom variant="subtitle1" component="h1">
                {details.url}
              </Typography>
              <Typography gutterBottom variant="subtitle1" component="h1">
                {details.desc}
              </Typography>
            </CardContent>
          </CardActionArea>
          <CardActions>
          <a href={`https://${details.url}`} target="_blank" rel="norefferer" >
            <Button
            >
            Go to the {details.title} link 
            </Button>
            </a>
            <Button
            onClick={() => handleDelete(details.id)}
            >Delete</Button>
          </CardActions>
        </Card>
      )}
    </div>
  )
}

export default IndexPage
