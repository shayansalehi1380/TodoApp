using TodoApp.Models.Common;

namespace TodoApp.Models.Todos
{
    public class DoTask: BaseEntity
    {
        public string Title { get; set; }
        public DateTime DueDate { get; set; }
        enum Status
        {
            Pending = 0,
            Complete = 1
        }
    }
}