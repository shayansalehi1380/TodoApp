using TodoApp.Models.Common;

namespace TodoApp.Models.Todos
{
    public class DoTask: BaseEntity
    {
        public string Title { get; set; }
        public DateTime DueDate { get; set; }
        public bool IsCompleted { get; set; }
        public bool IsDelete { get; set; }
        public string Status => IsCompleted ? "Completed" : "Pending";
    }
}