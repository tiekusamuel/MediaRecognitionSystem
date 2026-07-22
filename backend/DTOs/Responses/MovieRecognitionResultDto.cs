namespace backend.DTOs.Responses
{
    public class MovieRecognitionResultDto
    {
        public Guid RecognitionId { get; set; }
        public bool IsSuccessful { get; set; }
        public double ConfidenceScore { get; set; }
        public MovieDto? Movie { get; set; } 
        public DateTime RecognizedAt { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class MovieDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Poster { get; set; } = string.Empty;
        public List<string> Genre { get; set; } = new();
        public int ReleaseYear { get; set; }
        public string Director {get; set;} = string.Empty;

        public List<string> Cast { get; set; } = new();
       
        public string Duration {get; set;} = string.Empty;
        public string Synopsis {get; set;} = string.Empty;
        public string TrailerUrl {get; set;}= string.Empty;
        public string ImdbId { get; set; } = string.Empty;
        public double Rating { get; set; }
    }

    
}
