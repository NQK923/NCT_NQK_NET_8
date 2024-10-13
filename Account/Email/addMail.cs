using System.Net.Mail;
using System.Threading.Tasks;

namespace Account.Email
{
    public class AddMail
    {
        public static async Task<string> SendMail(string from, string to, string subject, string body)
        {
            MailMessage message = new MailMessage(from, to, subject, body)
            {
                BodyEncoding = System.Text.Encoding.UTF8,
                SubjectEncoding = System.Text.Encoding.UTF8,
                IsBodyHtml = true
            };

            message.ReplyToList.Add(new MailAddress(from));
            message.Sender = new MailAddress(from);
            
            using var smtp = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                EnableSsl = true,
                Credentials = new System.Net.NetworkCredential("manganctnqk@gmail.com", "pnhd ifwc hzox lfdh")
            };
            
            try
            {
                await smtp.SendMailAsync(message);
                return "success";
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return ex.Message;
            }
        }
    }
}