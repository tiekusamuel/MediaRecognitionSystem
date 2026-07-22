from google import genai


client = genai.Client(
    api_key="AIzaSyCkRswi1q6MueLU_l7WQvVuKmlQxcJE1Ag"
)


for model in client.models.list():

    print(model.name)