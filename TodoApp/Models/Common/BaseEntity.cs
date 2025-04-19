using System.ComponentModel.DataAnnotations;

namespace TodoApp.Models.Common
{
    public class BaseEntity
    {
        [Key]
        public int Id { get; set; }
        public bool IsDelete { get; set; }
    }
}
