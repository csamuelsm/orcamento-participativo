import React, { useEffect, useState } from 'react';

import {StyleSheet, View} from 'react-native';
import AppText from 'components/ui/AppText';
import NCutGraph from 'components/NCutGraph';

import strapi from '../../config/strapi';

type NCutResultsType = {
    propostaId:number;
};

async function getVotes(propostaId:number) {
    return strapi
    .find('n-cuts', {
      filters: {
        proposta: {
          id: {
            $eq: propostaId,
          },
        },
      },
      fields: ['voto'],
      populate: ['proposta']
    })
    .then((data: any) => {
      return data.data;
    })
    .catch(error => {
      console.log(error);
    });
}

export default function NCutResults(props:NCutResultsType) {

    const [areas, setAreas] = useState<string[]>([]);
    const [values, setValues] = useState<{[key:number]:number}>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);
        getVotes(props.propostaId)
        .then((data) => {

            //console.log(data);

            let numVotos = data.length;
            console.log("numVotos", numVotos)
            let results:{[key:number]:number} = {};

            let areasNames:string[] = [];
            let areasObject = data[0].attributes.proposta.data.attributes.areas;

            for (let key in areasObject) {
                results[parseInt(key)] = 0;
                areasNames.push(areasObject[key]);
            }

            setAreas(areasNames);

            for (let i = 0; i < numVotos; i++) {
                let voto = data[i].attributes.voto;
                for (let key in voto) {
                    results[parseInt(key)] += parseFloat(voto[key])/parseFloat(numVotos);
                }
            }

            setValues(results);
            setIsLoading(false);
        })
        .catch(error => {
            console.log(error);
        });

    }, []);

    useEffect(() => {

    }, [areas, values])

    return (
        <View style={styles.container}>
            {isLoading && <AppText style={styles.loading}>Carregando...</AppText>}
            {!isLoading &&
                <NCutGraph
                    areas={areas}
                    values={values}
                />
            }
        </View>
    )

}

const styles = {
    container: {
        flex: 1,
        width: '100%',
    },
    results: {
        padding: 10,
        marginTop: 10,
        borderRadius: 10,
        borderColor: '#532B1D',
        borderWidth: 1,
    },
    resultsText: {
        fontWeight: 'bold',
        fontSize: 15,
    },
    loading: {
        fontSize: 12,
        textAlign: 'center',
    }
}