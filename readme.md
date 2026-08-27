![recycle](https://www.readmecodegen.com/api/social-icon?name=recycle&size=76&animation=fade) 
# Disposal Scanner and Reminder Bot Whatsapp

## Completed
- [X] Scans the default provided image set and works accordingly as is.[bytedelay](https://github.com/bytedelay)
- [X] Generates dates based on the current image provided. [bytedelay](https://github.com/bytedelay)
- [X] Store it in CSV value for content readability. [bytedelay](https://github.com/bytedelay)

## Functionalities to be Added

- [ ] Integrate Whatsapp or similar API [utsav-3008](https://github.com/utsav-3008)
- [ ] Push notification into the group [utsav-3008](https://github.com/utsav-3008)
- [ ] Generalize for any image provided with any colour-channel combination [bytedelay](https://github.com/bytedelay)
- [ ] AI Integration for the sake that we did masters in AI? ;_;

## How to Run the docker image (Navigate to the app folder where run.sh)

- [ ] docker rm app-container
- [ ] docker build --no-cache -t multi-app-runner .
- [ ] docker run -it --name app-container multi-app-runner
