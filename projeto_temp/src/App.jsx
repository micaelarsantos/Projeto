import React, { useState, useEffect } from "react";
import { Container, Navbar, Form, Button, Toast, ToastContainer } from "react-bootstrap";

function App() {
  const apiKey = "dd04fa1890429625eb560ffc78ef68c1";

  const [cidade, setCidade] = useState("Lisbon");
  const [previsoes, setPrevisoes] = useState([]);
  const [climaHoje, setClimaHoje] = useState(null);
  const [notificacao, setNotificacao] = useState("");
  const [unidadeTemp, setUnidadeTemp] = useState("celsius");

  const converterGrau = (temperatura, unidade) => {
    if (unidade === "fahrenheit")
      return (temperatura * 1.8) + 32;
    else if (unidade === "celsius")
      return (temperatura - 32) / 9;
  };

  const clima = async () => {

    setNotificacao("");

    const urlAPI = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&units=${unidadeTemp}`;
    const request = await fetch(urlAPI);
    const getData = await request.json();

    if (getData.cod !== "200") {
      setNotificacao("City not found!");
      setClimaHoje(null);
      setPrevisoes([]);
      return;
    }

    const diasUnicos = {};
    for (let i = 0; i < getData.list.length; i++) {
      const item = getData.list[i];
      const diaTexto = new Date(item.dt * 1000).toDateString();

      if (!diasUnicos[diaTexto]) {
        diasUnicos[diaTexto] = item;
      }
    }

    const previsaoFormatada = Object.values(diasUnicos);

    const formatarPrevisao = (item) => {
      const dataObj = new Date(item.dt * 1000);
      return {
        data: dataObj,
        tempMin: converterGrau(item.main.temp_min, unidadeTemp),
        tempMax: converterGrau(item.main.temp_max, unidadeTemp),
        descricao: item.weather[0].description,
        icone: item.weather[0].icon,
      };
    };

    const hoje = formatarPrevisao(previsaoFormatada[0]);
    const seguintesDias = previsaoFormatada.slice(1, 7).map((prev) => formatarPrevisao(prev));

    setClimaHoje(hoje);
    setPrevisoes(seguintesDias);

  };

  useEffect(() => { clima() }, [cidade, unidadeTemp]);

  return (
    <>
      <div className="bg-body-tertiary w-100">
        <Container fluid className="py-2">
          <Navbar expand="lg">
            <h5><strong>Weather <img src="icon.png" style={{width:"35px", height:"auto"}}/> </strong></h5>
          </Navbar>
        </Container>
      </div>

      <Container className="py-4">
        <Form onSubmit={(e) => { e.preventDefault(); clima(); }}>
          <div className="row" style={{ justifyContent: "center" }}>
            <div className="col-md-8 mb-3">
              <Form.Control type="text" placeholder="Search for city ..." value={cidade} onChange={(e) => setCidade(e.target.value)} />
            </div>

            <div className="col-md-2 mb-3">
              <Button className="w-100" onClick={clima}>Search</Button>
            </div>
            <div className="col-lg-2 col-md-2 mb-3">
              <Form.Check type="switch" id="unit-switch" label={unidadeTemp === "celsius" ? "°C" : "°F"} checked={unidadeTemp === "fahrenheit"}
                onChange={() => setUnidadeTemp((prev) => (prev === "celsius" ? "fahrenheit" : "celsius"))}
              />
            </div>
          </div>
        </Form>

        <ToastContainer position="top-center" className="p-3">
          <Toast show={notificacao} onClose={() => setNotificacao("")} delay={2000} autohide style={{ padding: "10px", backgroundColor: "#ff9696" }}>
            {notificacao}
          </Toast>
        </ToastContainer>

        {climaHoje && (
          <div className="mb-5 text-center">
            <h4 style={{ textTransform: "capitalize" }}>
              {climaHoje.data.toLocaleDateString("en-EN", { weekday: "long"})}
            </h4>
            <img src={`https://openweathermap.org/img/wn/${climaHoje.icone}@4x.png`} />
            <p>
              <strong>Temp: </strong>
              {climaHoje.tempMax.toFixed(1)}{unidadeTemp === "celsius" ? "ºC" : "ºF"} - {" "}
              {climaHoje.tempMin.toFixed(1)}{unidadeTemp === "celsius" ? "ºC" : "ºF"}
            </p>
            <p style={{ textTransform: "capitalize" }}>{climaHoje.descricao}</p>
          </div>
        )}

        <div className="row" style={{ justifyContent: "center" }}>
          {previsoes.map((previsao, index) => {
            const dataFormatada = previsao.data.toLocaleDateString("en-EN", { weekday: "long", day: "numeric", month: "short" });
            const urlIcone = `https://openweathermap.org/img/wn/${previsao.icone}@2x.png`;

            return (
              <div className="col-md-4 col-lg-2" key={index} style={{
                margin: "10px", padding: "10px", borderRadius: "20px",
                textAlign: "center", boxShadow: "0 0 10px 0 rgba(51, 51, 51, 0.56)", border: "none"
              }}>
                <h6 style={{ textTransform: "capitalize", marginTop: "10px" }}>{dataFormatada}</h6>
                <img src={urlIcone} />
                <p>
                  <strong>
                    {previsao.tempMax.toFixed(1)} {unidadeTemp === "celsius" ? "ºC" : "ºF"} - {" "}
                    {previsao.tempMin.toFixed(1)} {unidadeTemp === "celsius" ? "ºC" : "ºF"}
                  </strong>
                </p>
                <small style={{ textTransform: "capitalize", marginBottom: "15px" }}> {previsao.descricao} </small>
              </div>
            );
          })}
        </div>
      </Container>
    </>
  );
}

export default App;
