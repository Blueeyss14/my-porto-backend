## Background

- GET.../mediaBackground/
- PUT/DELETE.../mediaBackground/id
- .../mediaBackground/id

### field ['data']
- id
- "filename"
- "mimetype" (auto fill)

---

## Messages
- GET.../messages/
- PUT/DELETE.../messages/id

### field ['data']
- id
- "user_name"
- "message"

---

## Music
- GET.../music/
- PUT/DELETE.../music/id
- ...uploads/music/song_file

### field ['data']
- id
- "song_name"
- "song_file"

---

## Category
- GET.../categories/
- DELETE.../categories/
- .../categories/

### field ['data']
- id
- "name"

---

## Project
- GET.../projects/
- GET.../projects/id
- PUT/DELETE.../projects/id
- .../projects/
- .../uploads/image_url

### field ['data']
- id
- "title"
- "subtitle"
- "description"
- "category"
- "is_pinned"
- "image_url" : [
                    {"url" : ""},
                    {"url" " ""},
                ]

- "tags" : 
            [
                "",
                "",
            ]

- "thumbnail"
- "contributing" : 
                    [
                        {
                            "name" : "",
                            "link" : ""
                        }
                    ]

- "resources" : 
                [
                    {
                        "name" : "",
                        "link" : ""
                    }
                ]